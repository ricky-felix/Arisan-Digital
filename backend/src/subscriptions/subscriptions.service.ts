import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PaymentTransactionsService } from '../payment-transactions/payment-transactions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { CreateGroupSubscriptionDto } from './dto/create-group-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

/** Compute the period-end date from now based on billing cycle. */
function computePeriodEnd(billingCycle: 'monthly' | 'yearly'): Date {
  const end = new Date();
  if (billingCycle === 'yearly') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly txService: PaymentTransactionsService,
  ) {}

  // ────────────────────────────────────────────────────────────────────
  // USER SUBSCRIPTIONS
  // ────────────────────────────────────────────────────────────────────

  /**
   * Returns the user's active subscription joined to the plan, or null if on free.
   */
  async getActiveForUser(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('user_subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data; // null means free tier
  }

  /**
   * Creates a user subscription.
   * - Throws 409 if the user already has an active subscription.
   * - Inserts a payment_transactions row of type='subscription_new'.
   * - Sets status='active' immediately (gateway webhook will update if needed).
   */
  async createUserSubscription(dto: CreateUserSubscriptionDto, userId: string) {
    // Idempotency: reject if already subscribed
    const existing = await this.getActiveForUser(userId);
    if (existing) {
      throw new ConflictException(
        'User already has an active subscription. Cancel it before subscribing to a new plan.',
      );
    }

    // Resolve plan_id from slug
    const plan = await this.resolvePlanBySlug(dto.plan_slug);

    const now = new Date();
    const periodEnd = computePeriodEnd(dto.billing_cycle);
    const gateway = dto.gateway ?? 'manual';

    // Insert subscription
    const { data: sub, error: subError } = await this.supabase.admin
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        billing_cycle: dto.billing_cycle,
        status: 'active',
        payment_ref: dto.payment_ref ?? null,
        gateway,
        started_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (subError) throw subError;

    // Record the transaction
    await this.txService.record({
      user_id: userId,
      type: 'subscription_new',
      gateway,
      amount: dto.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly,
      subscription_id: sub.id,
      gateway_tx_id: dto.payment_ref ?? null,
      status: gateway === 'manual' ? 'paid' : 'pending',
      paid_at: gateway === 'manual' ? now.toISOString() : null,
    });

    return sub;
  }

  /**
   * Cancels the authenticated user's active subscription.
   * Sets status='cancelled' and records cancelled_at.
   */
  async cancel(userId: string, _dto?: CancelSubscriptionDto) {
    const existing = await this.getActiveForUser(userId);
    if (!existing) {
      throw new NotFoundException('No active subscription found for this user.');
    }

    const { data, error } = await this.supabase.admin
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Finds active subscriptions past their current_period_end and marks them expired.
   * Intended for nightly cron job use.
   *
   * @param now Reference time — rows where current_period_end < now are expired.
   * @returns The count of subscriptions expired.
   */
  async expireDue(now: Date): Promise<{ expired_count: number }> {
    const isoNow = now.toISOString();

    const { data: userSubs, error: userError } = await this.supabase.admin
      .from('user_subscriptions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('current_period_end', isoNow)
      .select('id');

    if (userError) throw userError;

    const { data: groupSubs, error: groupError } = await this.supabase.admin
      .from('group_subscriptions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('current_period_end', isoNow)
      .select('id');

    if (groupError) throw groupError;

    const expired_count =
      (userSubs?.length ?? 0) + (groupSubs?.length ?? 0);

    return { expired_count };
  }

  // ────────────────────────────────────────────────────────────────────
  // GROUP SUBSCRIPTIONS
  // ────────────────────────────────────────────────────────────────────

  /**
   * Returns the group's active subscription joined to the plan, or null if on free.
   */
  async getActiveForGroup(groupId: string) {
    const { data, error } = await this.supabase.admin
      .from('group_subscriptions')
      .select('*, plans(*)')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Creates a group subscription. Only the group admin may do this.
   * - Validates that the calling user is admin_id of the group.
   * - Throws 409 if the group already has an active subscription.
   */
  async createGroupSubscription(
    dto: CreateGroupSubscriptionDto,
    userId: string,
  ) {
    // Only the group admin may subscribe the group
    await this.assertGroupAdmin(dto.group_id, userId);

    // Idempotency: reject if already subscribed
    const existing = await this.getActiveForGroup(dto.group_id);
    if (existing) {
      throw new ConflictException(
        'This group already has an active subscription. Cancel it before subscribing to a new plan.',
      );
    }

    const plan = await this.resolvePlanBySlug(dto.plan_slug);

    const now = new Date();
    const periodEnd = computePeriodEnd(dto.billing_cycle);
    const gateway = dto.gateway ?? 'manual';

    const { data: sub, error: subError } = await this.supabase.admin
      .from('group_subscriptions')
      .insert({
        group_id: dto.group_id,
        paid_by: userId,
        plan_id: plan.id,
        billing_cycle: dto.billing_cycle,
        status: 'active',
        payment_ref: dto.payment_ref ?? null,
        gateway,
        started_at: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (subError) throw subError;

    await this.txService.record({
      user_id: userId,
      type: 'subscription_new',
      gateway,
      amount: dto.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly,
      group_subscription_id: sub.id,
      gateway_tx_id: dto.payment_ref ?? null,
      status: gateway === 'manual' ? 'paid' : 'pending',
      paid_at: gateway === 'manual' ? now.toISOString() : null,
    });

    return sub;
  }

  /**
   * Cancels the group's active subscription. Only the group admin may cancel.
   */
  async cancelGroup(
    groupId: string,
    userId: string,
    _dto?: CancelSubscriptionDto,
  ) {
    await this.assertGroupAdmin(groupId, userId);

    const existing = await this.getActiveForGroup(groupId);
    if (!existing) {
      throw new NotFoundException(
        `No active subscription found for group ${groupId}.`,
      );
    }

    const { data, error } = await this.supabase.admin
      .from('group_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ────────────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────────────

  /**
   * Extends the current_period_end for a user subscription after a confirmed payment.
   * Called by BillingService during webhook reconciliation.
   */
  async activateAndExtendUserSub(
    subscriptionId: string,
    billingCycle: 'monthly' | 'yearly',
  ) {
    const periodEnd = computePeriodEnd(billingCycle);

    const { data, error } = await this.supabase.admin
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Extends the current_period_end for a group subscription after a confirmed payment.
   * Called by BillingService during webhook reconciliation.
   */
  async activateAndExtendGroupSub(
    groupSubscriptionId: string,
    billingCycle: 'monthly' | 'yearly',
  ) {
    const periodEnd = computePeriodEnd(billingCycle);

    const { data, error } = await this.supabase.admin
      .from('group_subscriptions')
      .update({
        status: 'active',
        current_period_end: periodEnd.toISOString(),
      })
      .eq('id', groupSubscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async resolvePlanBySlug(slug: string) {
    const { data, error } = await this.supabase.admin
      .from('plans')
      .select('id, price_monthly, price_yearly, is_active')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Plan '${slug}' not found`);
    if (!data.is_active) {
      throw new ForbiddenException(`Plan '${slug}' is no longer available`);
    }
    return data;
  }

  private async assertGroupAdmin(groupId: string, userId: string): Promise<void> {
    const { data: group } = await this.supabase.admin
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .maybeSingle();

    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    if (group.admin_id !== userId) {
      throw new ForbiddenException(
        'Only the group admin can manage the group subscription',
      );
    }
  }
}
