import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { Frequency } from '../common/types/schema.types';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAllForUser(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('groups')
      .select('*, group_members!inner(user_id, group_role)')
      .eq('group_members.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.admin
      .from('groups')
      .select('*, group_members(id, user_id, group_role, giliran_order, joined_at)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Group ${id} not found`);
    return data;
  }

  async create(dto: CreateGroupDto, userId: string) {
    const { data: group, error } = await this.supabase.admin
      .from('groups')
      .insert({
        name: dto.name,
        description: dto.description ?? null,
        photo_url: dto.photo_url ?? null,
        amount_per_round: dto.amount_per_round,
        frequency: dto.frequency,
        giliran_method: dto.giliran_method,
        start_date: dto.start_date,
        total_rounds: dto.total_rounds,
        admin_id: userId,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Insert creator as group admin member
    await this.supabase.admin.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      group_role: 'admin',
    });

    // Scaffold rounds when giliran_method is 'random'
    if (dto.giliran_method === 'random') {
      await this.scaffoldRounds(
        group.id,
        dto.total_rounds,
        dto.start_date,
        dto.frequency,
      );
    }

    return group;
  }

  async update(id: string, dto: UpdateGroupDto, userId: string) {
    await this.assertGroupAdmin(id, userId);

    const { data, error } = await this.supabase.admin
      .from('groups')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Group ${id} not found`);
    return data;
  }

  async remove(id: string, userId: string) {
    // Only the original admin_id (creator) can delete the group
    const { data: group } = await this.supabase.admin
      .from('groups')
      .select('admin_id')
      .eq('id', id)
      .maybeSingle();

    if (!group) throw new NotFoundException(`Group ${id} not found`);
    if (group.admin_id !== userId) {
      throw new ForbiddenException('Only the group creator can delete this group');
    }

    const { error } = await this.supabase.admin
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Group deleted successfully' };
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

  private async scaffoldRounds(
    groupId: string,
    totalRounds: number,
    startDate: string,
    frequency: Frequency,
  ): Promise<void> {
    const rounds = [];
    let current = new Date(startDate);

    for (let i = 1; i <= totalRounds; i++) {
      rounds.push({
        group_id: groupId,
        round_number: i,
        scheduled_date: current.toISOString().split('T')[0],
        status: 'upcoming',
      });

      if (frequency === 'weekly') {
        current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else {
        // monthly: advance by one calendar month
        const next = new Date(current);
        next.setMonth(next.getMonth() + 1);
        current = next;
      }
    }

    const { error } = await this.supabase.admin.from('rounds').insert(rounds);
    if (error) throw error;
  }
}
