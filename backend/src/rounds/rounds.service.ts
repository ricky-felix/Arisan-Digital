import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RoundsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listForGroup(groupId: string) {
    const { data, error } = await this.supabase.admin
      .from('rounds')
      .select('*')
      .eq('group_id', groupId)
      .order('round_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.admin
      .from('rounds')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Round ${id} not found`);
    return data;
  }

  async setRecipient(roundId: string, recipientId: string, requesterId: string) {
    const round = await this.findOne(roundId);
    await this.assertGroupAdmin(round.group_id, requesterId);

    const { data, error } = await this.supabase.admin
      .from('rounds')
      .update({ recipient_id: recipientId })
      .eq('id', roundId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async activate(roundId: string, requesterId: string) {
    const round = await this.findOne(roundId);
    await this.assertGroupAdmin(round.group_id, requesterId);

    if (round.status !== 'upcoming') {
      throw new BadRequestException(
        `Round cannot be activated — current status is '${round.status}'`,
      );
    }

    const { data, error } = await this.supabase.admin
      .from('rounds')
      .update({ status: 'active' })
      .eq('id', roundId)
      .select()
      .single();

    if (error) throw error;

    // Mark the group as active if it is still pending
    await this.supabase.admin
      .from('groups')
      .update({ status: 'active' })
      .eq('id', round.group_id)
      .eq('status', 'pending');

    return data;
  }

  async complete(roundId: string, requesterId: string) {
    const round = await this.findOne(roundId);
    await this.assertGroupAdmin(round.group_id, requesterId);

    if (round.status !== 'active') {
      throw new BadRequestException(
        `Round cannot be completed — current status is '${round.status}'`,
      );
    }

    const completedAt = new Date().toISOString();

    const { data, error } = await this.supabase.admin
      .from('rounds')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('id', roundId)
      .select()
      .single();

    if (error) throw error;

    // Check if this was the last round and auto-complete the group
    const { data: remaining } = await this.supabase.admin
      .from('rounds')
      .select('id')
      .eq('group_id', round.group_id)
      .neq('status', 'completed');

    if (!remaining || remaining.length === 0) {
      await this.supabase.admin
        .from('groups')
        .update({ status: 'completed' })
        .eq('id', round.group_id);
    }

    return data;
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
