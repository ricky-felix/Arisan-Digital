import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InviteLinksService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateInviteDto, userId: string) {
    await this.assertGroupAdmin(dto.group_id, userId);

    const { data, error } = await this.supabase.admin
      .from('invite_links')
      .insert({
        group_id: dto.group_id,
        created_by: userId,
        max_uses: dto.max_uses ?? null,
        expires_at: dto.expires_at ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listForGroup(groupId: string, userId: string) {
    await this.assertGroupAdmin(groupId, userId);

    const { data, error } = await this.supabase.admin
      .from('invite_links')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async revoke(id: string, userId: string) {
    const { data: invite } = await this.supabase.admin
      .from('invite_links')
      .select('id, group_id, is_active')
      .eq('id', id)
      .maybeSingle();

    if (!invite) throw new NotFoundException(`Invite link ${id} not found`);
    await this.assertGroupAdmin(invite.group_id, userId);

    const { data, error } = await this.supabase.admin
      .from('invite_links')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async redeem(token: string, userId: string) {
    // Fetch invite by token using admin client (bypasses RLS which restricts to admins only)
    const { data: invite, error: inviteError } = await this.supabase.admin
      .from('invite_links')
      .select('*, groups(id, name, description, photo_url, status)')
      .eq('token', token)
      .maybeSingle();

    if (inviteError) throw inviteError;
    if (!invite) throw new NotFoundException('Invite link not found or invalid');
    if (!invite.is_active) {
      throw new BadRequestException('This invite link has been revoked');
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new BadRequestException('This invite link has expired');
    }
    if (invite.max_uses != null && invite.use_count >= invite.max_uses) {
      throw new BadRequestException('This invite link has reached its maximum uses');
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabase.admin
      .from('group_members')
      .select('id')
      .eq('group_id', invite.group_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      throw new BadRequestException('You are already a member of this group');
    }

    // Insert group_members row
    const { error: memberError } = await this.supabase.admin
      .from('group_members')
      .insert({
        group_id: invite.group_id,
        user_id: userId,
        group_role: 'member',
      });

    if (memberError) throw memberError;

    // Increment use_count
    const { error: incrementError } = await this.supabase.admin
      .from('invite_links')
      .update({ use_count: invite.use_count + 1 })
      .eq('id', invite.id);

    if (incrementError) throw incrementError;

    return {
      message: 'Successfully joined the group',
      group: invite.groups,
    };
  }

  /** Asserts the requester is the admin_id OR has group_role='admin' */
  private async assertGroupAdmin(groupId: string, userId: string): Promise<void> {
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
