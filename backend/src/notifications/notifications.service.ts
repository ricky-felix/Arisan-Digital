import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { NotificationType } from '../common/types/schema.types';

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(input: CreateNotificationInput) {
    const { data, error } = await this.supabase.admin
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata ?? null,
        is_read: false,
      })
      .select()
      .single();

    // Notification failures must never crash the caller — log and continue.
    if (error) {
      console.error('[NotificationsService] Failed to insert notification', error);
      return null;
    }
    return data;
  }

  /**
   * Fire notifications to multiple recipients in parallel.
   * Ignores individual failures so that one bad user_id does not block others.
   */
  async createMany(notifications: CreateNotificationInput[]): Promise<void> {
    await Promise.allSettled(notifications.map((n) => this.create(n)));
  }

  async listMine(userId: string, opts?: { limit?: number; offset?: number }) {
    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;

    const { data, error } = await this.supabase.admin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async markRead(id: string, userId: string) {
    const { data: existing } = await this.supabase.admin
      .from('notifications')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.user_id !== userId) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    const { data, error } = await this.supabase.admin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markAllRead(userId: string) {
    const { error } = await this.supabase.admin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { message: 'All notifications marked as read' };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const { count, error } = await this.supabase.admin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { count: count ?? 0 };
  }
}
