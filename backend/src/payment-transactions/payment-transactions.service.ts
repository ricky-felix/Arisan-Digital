import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type {
  Gateway,
  TransactionStatus,
  TransactionType,
} from '../common/types/schema.types';

export interface RecordTransactionInput {
  user_id: string;
  type: TransactionType;
  gateway: Gateway;
  amount: number;
  subscription_id?: string | null;
  group_subscription_id?: string | null;
  gateway_tx_id?: string | null;
  gateway_status?: string | null;
  currency?: string;
  status?: TransactionStatus;
  gateway_payload?: Record<string, unknown> | null;
  paid_at?: string | null;
}

export interface UpdateTransactionInput {
  status?: TransactionStatus;
  paid_at?: string | null;
  gateway_status?: string | null;
  gateway_payload?: Record<string, unknown> | null;
}

@Injectable()
export class PaymentTransactionsService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Records a new payment transaction row.
   * Called internally by SubscriptionsService and webhook handlers.
   */
  async record(input: RecordTransactionInput) {
    const { data, error } = await this.supabase.admin
      .from('payment_transactions')
      .insert({
        user_id: input.user_id,
        type: input.type,
        gateway: input.gateway,
        amount: input.amount,
        subscription_id: input.subscription_id ?? null,
        group_subscription_id: input.group_subscription_id ?? null,
        gateway_tx_id: input.gateway_tx_id ?? null,
        gateway_status: input.gateway_status ?? null,
        currency: input.currency ?? 'IDR',
        status: input.status ?? 'pending',
        gateway_payload: input.gateway_payload ?? null,
        paid_at: input.paid_at ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Idempotent update by gateway_tx_id.
   * Webhook handlers may retry — safe to call multiple times with the same data.
   * Returns null if no matching transaction is found (caller may skip reconciliation).
   */
  async updateByGatewayTxId(
    gatewayTxId: string,
    update: UpdateTransactionInput,
  ) {
    // First, look up the row so we can return the updated version
    const { data: existing, error: findError } = await this.supabase.admin
      .from('payment_transactions')
      .select('id, status')
      .eq('gateway_tx_id', gatewayTxId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return null; // Unknown tx — let caller decide

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (update.status !== undefined) patch.status = update.status;
    if (update.paid_at !== undefined) patch.paid_at = update.paid_at;
    if (update.gateway_status !== undefined) patch.gateway_status = update.gateway_status;
    if (update.gateway_payload !== undefined) patch.gateway_payload = update.gateway_payload;

    const { data, error } = await this.supabase.admin
      .from('payment_transactions')
      .update(patch)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves a transaction by its internal ID.
   * Used by the billing service to find subscription IDs for reconciliation.
   */
  async findById(id: string) {
    const { data, error } = await this.supabase.admin
      .from('payment_transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Transaction ${id} not found`);
    return data;
  }

  /**
   * Retrieves a transaction by its gateway_tx_id.
   * Used by the billing service during webhook reconciliation.
   */
  async findByGatewayTxId(gatewayTxId: string) {
    const { data, error } = await this.supabase.admin
      .from('payment_transactions')
      .select('*')
      .eq('gateway_tx_id', gatewayTxId)
      .maybeSingle();

    if (error) throw error;
    return data; // null if not found — caller handles
  }

  /**
   * Lists all transactions for the authenticated user, newest first.
   */
  async listMine(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Lists all transactions across all users — super_admin only.
   * @param opts Optional filters: status, gateway, type.
   */
  async listAll(
    opts: {
      status?: TransactionStatus;
      gateway?: Gateway;
      type?: TransactionType;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    let query = this.supabase.admin
      .from('payment_transactions')
      .select('*, users(id, name, email)')
      .order('created_at', { ascending: false });

    if (opts.status) query = query.eq('status', opts.status);
    if (opts.gateway) query = query.eq('gateway', opts.gateway);
    if (opts.type) query = query.eq('type', opts.type);

    const limit = opts.limit ?? 50;
    const offset = opts.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
