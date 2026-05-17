// Mirror of supabase/schema.sql — keep in sync when migrating

export type PlatformRole = 'user' | 'super_admin';
export type GroupRole = 'member' | 'admin';
export type Frequency = 'weekly' | 'monthly';
export type GiliranMethod = 'random' | 'manual';
export type GroupStatus = 'active' | 'completed' | 'pending';
export type RoundStatus = 'upcoming' | 'active' | 'completed';
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected';
export type Language = 'id' | 'en';

export type BillCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'other';

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';
export type BillStatus = 'open' | 'settled';
export type SettlementStatus = 'pending' | 'confirmed' | 'rejected';
export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';
export type DebtStatus = 'pending' | 'settled' | 'dismissed';

export type PlanSlug = 'free' | 'boss' | 'business';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type Gateway = 'xendit' | 'midtrans' | 'manual';
export type TransactionType =
  | 'subscription_new'
  | 'subscription_renewal'
  | 'subscription_upgrade'
  | 'in_app_payment';
export type TransactionStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'expired';

export type NotificationType =
  | 'payment_due'
  | 'payment_confirmed'
  | 'payment_rejected'
  | 'giliran_announced'
  | 'member_joined'
  | 'round_completed'
  | 'bill_created'
  | 'bill_settled'
  | 'bill_reminder'
  | 'settlement_confirmed'
  | 'settlement_rejected';

export interface AuthUser {
  id: string;
  email?: string;
  platform_role: PlatformRole;
}
