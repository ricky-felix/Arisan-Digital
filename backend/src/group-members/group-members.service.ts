import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AddMemberDto } from './dto/add-member.dto';
import { AssignGiliranDto } from './dto/assign-giliran.dto';

@Injectable()
export class GroupMembersService {
  constructor(private readonly supabase: SupabaseService) {}

  async listForGroup(groupId: string) {
    const { data, error } = await this.supabase.admin
      .from('group_members')
      .select('id, group_id, user_id, giliran_order, group_role, joined_at')
      .eq('group_id', groupId)
      .order('giliran_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  }

  async addMember(
    groupId: string,
    dto: AddMemberDto,
    requesterId: string,
  ) {
    await this.assertGroupAdmin(groupId, requesterId);

    const { data, error } = await this.supabase.admin
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: dto.user_id,
        group_role: dto.group_role ?? 'member',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('User is already a member of this group');
      }
      throw error;
    }

    return data;
  }

  async removeMember(
    groupId: string,
    userId: string,
    requesterId: string,
  ) {
    await this.assertGroupAdmin(groupId, requesterId);

    // Prevent removing the primary admin
    const { data: group } = await this.supabase.admin
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .maybeSingle();

    if (group?.admin_id === userId) {
      throw new ForbiddenException('Cannot remove the group creator from the group');
    }

    const { error } = await this.supabase.admin
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Member removed successfully' };
  }

  async assignGiliranOrder(
    groupId: string,
    dto: AssignGiliranDto,
    requesterId: string,
  ) {
    await this.assertGroupAdmin(groupId, requesterId);

    const { data: group } = await this.supabase.admin
      .from('groups')
      .select('giliran_method')
      .eq('id', groupId)
      .maybeSingle();

    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    // Validate no duplicate giliran_order values in the request
    const orders = dto.assignments.map((a) => a.giliran_order);
    if (new Set(orders).size !== orders.length) {
      throw new BadRequestException('Duplicate giliran_order values are not allowed');
    }

    // Update each member's giliran_order individually to respect the UNIQUE constraint
    for (const assignment of dto.assignments) {
      const { error } = await this.supabase.admin
        .from('group_members')
        .update({ giliran_order: assignment.giliran_order })
        .eq('group_id', groupId)
        .eq('user_id', assignment.user_id);

      if (error) throw error;
    }

    return this.listForGroup(groupId);
  }

  async randomShuffle(groupId: string, requesterId: string) {
    await this.assertGroupAdmin(groupId, requesterId);

    const { data: members, error } = await this.supabase.admin
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (error) throw error;
    if (!members || members.length === 0) {
      throw new BadRequestException('No members found in this group');
    }

    // Fisher-Yates shuffle to generate random unique order
    const indices = members.map((_, i) => i + 1);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // First clear all giliran_orders to avoid unique constraint conflicts
    await this.supabase.admin
      .from('group_members')
      .update({ giliran_order: null })
      .eq('group_id', groupId);

    for (let i = 0; i < members.length; i++) {
      const { error: updateError } = await this.supabase.admin
        .from('group_members')
        .update({ giliran_order: indices[i] })
        .eq('group_id', groupId)
        .eq('user_id', members[i].user_id);

      if (updateError) throw updateError;
    }

    return this.listForGroup(groupId);
  }

  /** Asserts the requester is the admin_id OR has group_role='admin' in group_members */
  async assertGroupAdmin(groupId: string, userId: string): Promise<void> {
    const { data: group } = await this.supabase.admin
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .maybeSingle();

    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    if (group.admin_id === userId) return;

    const { data: membership } = await this.supabase.admin
      .from('group_members')
      .select('group_role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (membership?.group_role !== 'admin') {
      throw new ForbiddenException('You are not an admin of this group');
    }
  }
}
