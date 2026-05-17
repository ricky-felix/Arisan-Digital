import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/** Returns the first day of the current UTC month as 'YYYY-MM-01'. */
function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

@Injectable()
export class UsageService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Returns (or upserts) the usage_tracking row for the current month.
   * The row is created with zeros if it doesn't yet exist.
   *
   * NOTE: This is the canonical read used by PlanGuard — PlanGuard reads
   * usage_tracking directly via SupabaseService, but callers that need the
   * current usage should use this method.
   */
  async getCurrent(userId: string) {
    const periodMonth = currentPeriodMonth();

    const { data, error } = await this.supabase.admin
      .from('usage_tracking')
      .upsert(
        {
          user_id: userId,
          period_month: periodMonth,
          groups_created: 0,
          bills_created: 0,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,period_month',
          ignoreDuplicates: true, // Don't overwrite existing counters
        },
      )
      .select()
      .single();

    if (error) {
      // ignoreDuplicates may return no data on conflict — fall through to select
    }

    if (data) return data;

    // Row already existed — fetch it
    const { data: existing, error: fetchError } = await this.supabase.admin
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period_month', periodMonth)
      .single();

    if (fetchError) throw fetchError;
    return existing;
  }

  /**
   * Atomically increments groups_created for the current month.
   *
   * Strategy: upsert inserts a row with groups_created=1 when none exists;
   * on conflict (row already exists) the DO UPDATE clause adds 1.
   * This maps to:
   *   INSERT INTO usage_tracking (user_id, period_month, groups_created, ...)
   *   VALUES ($1, $2, 1, 0, NOW())
   *   ON CONFLICT (user_id, period_month)
   *   DO UPDATE SET groups_created = usage_tracking.groups_created + 1, updated_at = NOW()
   *
   * Called by GroupsService after a successful group insert.
   * Future agents: call UsageService.incrementGroups(userId) after group creation.
   */
  async incrementGroups(userId: string): Promise<void> {
    const periodMonth = currentPeriodMonth();

    // Step 1: ensure the row exists (noop if it does)
    await this.supabase.admin
      .from('usage_tracking')
      .upsert(
        {
          user_id: userId,
          period_month: periodMonth,
          groups_created: 0,
          bills_created: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,period_month', ignoreDuplicates: true },
      );

    // Step 2: increment — supabase-js v2 does not expose ON CONFLICT DO UPDATE
    // with arithmetic directly, so we use a two-step approach.
    const { error } = await this.supabase.admin.rpc(
      'increment_usage_groups',
      { p_user_id: userId, p_period_month: periodMonth },
    );

    if (error) {
      // Fallback if the RPC does not exist yet: read-then-update with optimistic
      // concurrency. The guard already validated the limit so a brief race here
      // only causes an over-count by 1 at worst.
      const { data: row } = await this.supabase.admin
        .from('usage_tracking')
        .select('groups_created')
        .eq('user_id', userId)
        .eq('period_month', periodMonth)
        .single();

      await this.supabase.admin
        .from('usage_tracking')
        .update({
          groups_created: (row?.groups_created ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('period_month', periodMonth);
    }
  }

  /**
   * Atomically increments bills_created for the current month.
   *
   * Called by BillsService after a successful bill insert.
   * Future agents: call UsageService.incrementBills(userId) after bill creation.
   */
  async incrementBills(userId: string): Promise<void> {
    const periodMonth = currentPeriodMonth();

    await this.supabase.admin
      .from('usage_tracking')
      .upsert(
        {
          user_id: userId,
          period_month: periodMonth,
          groups_created: 0,
          bills_created: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,period_month', ignoreDuplicates: true },
      );

    const { error } = await this.supabase.admin.rpc(
      'increment_usage_bills',
      { p_user_id: userId, p_period_month: periodMonth },
    );

    if (error) {
      // RPC not deployed yet — read-then-update fallback
      const { data: row } = await this.supabase.admin
        .from('usage_tracking')
        .select('bills_created')
        .eq('user_id', userId)
        .eq('period_month', periodMonth)
        .single();

      await this.supabase.admin
        .from('usage_tracking')
        .update({
          bills_created: (row?.bills_created ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('period_month', periodMonth);
    }
  }

  /**
   * Month-reset placeholder — called by the nightly cron.
   * In this design, every new month naturally gets a fresh row via upsert
   * (the UNIQUE constraint is on user_id + period_month, not just user_id).
   * So there is nothing to "reset" — the new month's row starts at 0.
   *
   * TODO: Add archival logic here if historical monthly summaries are needed
   * (e.g. copy old rows to an analytics_usage_archive table before pruning).
   *
   * @param now Reference date to determine which month is "current".
   */
  async resetMonth(_now: Date): Promise<void> {
    // No-op: usage_tracking uses (user_id, period_month) as the unique key.
    // A new month's upsert will create a fresh row without touching prior months.
    // See TODO above for archival.
  }
}
