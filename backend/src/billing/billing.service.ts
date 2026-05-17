import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PaymentTransactionsService } from '../payment-transactions/payment-transactions.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { TransactionStatus } from '../common/types/schema.types';

export interface WebhookReconcileInput {
  gatewayTxId: string;
  status: TransactionStatus;
  gatewayStatus: string;
  gatewayPayload: Record<string, unknown>;
  paidAt?: string | null;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly txService: PaymentTransactionsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Central reconciliation logic called by both Xendit and Midtrans webhook controllers.
   *
   * Steps:
   *  1. Update payment_transactions row with the new status.
   *  2. If payment is now 'paid' and the transaction is a subscription type,
   *     activate/extend the linked user_subscriptions or group_subscriptions row.
   *
   * This method is idempotent — calling it multiple times with the same
   * gateway_tx_id is safe (updates patch to the same values each time).
   */
  async reconcile(input: WebhookReconcileInput): Promise<void> {
    // Step 1: Update the transaction ledger row
    const tx = await this.txService.updateByGatewayTxId(input.gatewayTxId, {
      status: input.status,
      gateway_status: input.gatewayStatus,
      gateway_payload: input.gatewayPayload,
      paid_at: input.paidAt ?? null,
    });

    if (!tx) {
      this.logger.warn(
        `Webhook received for unknown gateway_tx_id: ${input.gatewayTxId}`,
      );
      return;
    }

    // Step 2: Only proceed with subscription activation on confirmed payment
    if (input.status !== 'paid') return;

    const subscriptionTypes = [
      'subscription_new',
      'subscription_renewal',
      'subscription_upgrade',
    ];

    if (!subscriptionTypes.includes(tx.type as string)) return;

    // Step 3a: Activate / extend user subscription if linked
    if (tx.subscription_id) {
      try {
        const billingCycle = await this.getSubBillingCycle(
          tx.subscription_id,
          false,
        );
        if (billingCycle) {
          await this.subscriptionsService.activateAndExtendUserSub(
            tx.subscription_id,
            billingCycle,
          );
          this.logger.log(
            `User subscription ${tx.subscription_id} activated via gateway_tx_id ${input.gatewayTxId}`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Failed to extend user subscription ${tx.subscription_id}: ${String(err)}`,
        );
      }
    }

    // Step 3b: Activate / extend group subscription if linked
    if (tx.group_subscription_id) {
      try {
        const billingCycle = await this.getSubBillingCycle(
          tx.group_subscription_id,
          true,
        );
        if (billingCycle) {
          await this.subscriptionsService.activateAndExtendGroupSub(
            tx.group_subscription_id,
            billingCycle,
          );
          this.logger.log(
            `Group subscription ${tx.group_subscription_id} activated via gateway_tx_id ${input.gatewayTxId}`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Failed to extend group subscription ${tx.group_subscription_id}: ${String(err)}`,
        );
      }
    }
  }

  /**
   * Reads billing_cycle from user_subscriptions or group_subscriptions by ID.
   * Returns null if the row doesn't exist.
   */
  private async getSubBillingCycle(
    id: string,
    isGroup: boolean,
  ): Promise<'monthly' | 'yearly' | null> {
    const table = isGroup ? 'group_subscriptions' : 'user_subscriptions';

    const { data, error } = await this.supabase.admin
      .from(table)
      .select('billing_cycle')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      this.logger.error(`Error reading billing_cycle for ${table} ${id}: ${String(error)}`);
      return null;
    }

    return (data?.billing_cycle as 'monthly' | 'yearly') ?? null;
  }
}
