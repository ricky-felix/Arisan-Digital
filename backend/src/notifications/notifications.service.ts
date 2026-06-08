import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { NotificationType } from '../common/types/schema.types';

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

/** How far back we look when deduplicating reminders (24 h). */
const REMINDER_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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

  // ─────────────────────────────────────────────────────────────────────────
  // Payment-reminder batch job
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Finds upcoming/overdue obligations and creates reminder notifications.
   *
   * Arisan: for every round in status 'upcoming' or 'active' whose
   *   scheduled_date <= now + 24 h, notify each group member who does NOT
   *   yet have a confirmed payment for that round.
   *
   * Patungan: for every bill_settlements row with status = 'pending', notify
   *   the payer that a settlement is outstanding.
   *
   * Idempotency strategy (schema limitation noted):
   *   The notifications table has no dedicated reference_id column.  We
   *   guard against duplicates by querying for an existing notification with
   *   the same (user_id, type, metadata->>'round_id' | metadata->>'settlement_id')
   *   created within the last 24 hours.  If one exists we skip that row.
   *   LIMITATION: two runs in the same 24-hour window will not produce a
   *   second notification, but a run that straddles midnight may produce
   *   one extra reminder.  A dedicated dedup column (e.g. dedup_key UNIQUE)
   *   would make this perfectly idempotent.
   *
   * @returns count of notifications actually inserted.
   */
  async createPaymentReminders(now: Date): Promise<{ created: number }> {
    const dedupCutoff = new Date(now.getTime() - REMINDER_DEDUP_WINDOW_MS).toISOString();
    let created = 0;

    // ── 1. Arisan: rounds due within the next 24 h or already overdue ──────
    const lookaheadDate = new Date(now.getTime() + REMINDER_DEDUP_WINDOW_MS)
      .toISOString()
      .slice(0, 10); // DATE string: YYYY-MM-DD
    const nowDate = now.toISOString().slice(0, 10);

    const { data: dueRounds, error: roundsErr } = await this.supabase.admin
      .from('rounds')
      .select('id, group_id, round_number, scheduled_date')
      // upcoming or active rounds — 'completed' are already done
      .in('status', ['upcoming', 'active'])
      // scheduled_date <= now + 24 h  (overdue included because any past date satisfies this)
      .lte('scheduled_date', lookaheadDate);

    if (roundsErr) {
      this.logger.error('createPaymentReminders: failed to fetch due rounds', roundsErr);
    } else if (dueRounds && dueRounds.length > 0) {
      for (const round of dueRounds) {
        // All members of this group
        const { data: members, error: membersErr } = await this.supabase.admin
          .from('group_members')
          .select('user_id')
          .eq('group_id', round.group_id);

        if (membersErr || !members) {
          this.logger.warn(
            `createPaymentReminders: could not fetch members for group ${round.group_id}`,
          );
          continue;
        }

        // Members who have already paid (confirmed) this round
        const { data: confirmedPayments, error: paymentsErr } = await this.supabase.admin
          .from('payments')
          .select('payer_id')
          .eq('round_id', round.id)
          .eq('status', 'confirmed');

        if (paymentsErr) {
          this.logger.warn(
            `createPaymentReminders: could not fetch payments for round ${round.id}`,
          );
          continue;
        }

        const paidUserIds = new Set((confirmedPayments ?? []).map((p) => p.payer_id));

        const isOverdue = round.scheduled_date < nowDate;
        const title = isOverdue
          ? 'Iuran Arisan Telat!'
          : 'Iuran Arisan Jatuh Tempo Besok';

        for (const member of members) {
          if (paidUserIds.has(member.user_id)) continue; // already paid

          // Dedup: skip if a payment_due reminder for this round was sent in the last 24 h
          const { data: existing } = await this.supabase.admin
            .from('notifications')
            .select('id')
            .eq('user_id', member.user_id)
            .eq('type', 'payment_due' satisfies NotificationType)
            .gte('created_at', dedupCutoff)
            .contains('metadata', { round_id: round.id })
            .maybeSingle();

          if (existing) continue; // reminder already sent within the window

          const body = isOverdue
            ? `Iuran kamu untuk Putaran #${round.round_number} sudah melewati tanggal jatuh tempo (${round.scheduled_date}). Segera bayar!`
            : `Iuran kamu untuk Putaran #${round.round_number} jatuh tempo besok (${round.scheduled_date}). Jangan lupa bayar!`;

          const result = await this.create({
            user_id: member.user_id,
            type: 'payment_due',
            title,
            body,
            metadata: {
              group_id: round.group_id,
              round_id: round.id,
              round_number: round.round_number,
              scheduled_date: round.scheduled_date,
              is_overdue: isOverdue,
            },
          });

          if (result) created++;
        }
      }
    }

    // ── 2. Patungan: pending bill settlements ────────────────────────────────
    const { data: pendingSettlements, error: settlementsErr } = await this.supabase.admin
      .from('bill_settlements')
      .select('id, bill_id, payer_id, amount')
      .eq('status', 'pending');

    if (settlementsErr) {
      this.logger.error(
        'createPaymentReminders: failed to fetch pending settlements',
        settlementsErr,
      );
    } else if (pendingSettlements && pendingSettlements.length > 0) {
      for (const settlement of pendingSettlements) {
        // Dedup: skip if a bill_reminder for this settlement was sent in the last 24 h
        const { data: existing } = await this.supabase.admin
          .from('notifications')
          .select('id')
          .eq('user_id', settlement.payer_id)
          .eq('type', 'bill_reminder' satisfies NotificationType)
          .gte('created_at', dedupCutoff)
          .contains('metadata', { settlement_id: settlement.id })
          .maybeSingle();

        if (existing) continue;

        const result = await this.create({
          user_id: settlement.payer_id,
          type: 'bill_reminder',
          title: 'Tagihan Patungan Menunggu',
          body: `Kamu masih punya tagihan patungan sebesar Rp ${settlement.amount.toLocaleString('id-ID')} yang belum diselesaikan. Yuk, segera bayar!`,
          metadata: {
            bill_id: settlement.bill_id,
            settlement_id: settlement.id,
            amount: settlement.amount,
          },
        });

        if (result) created++;
      }
    }

    return { created };
  }
}
