import { Module } from '@nestjs/common';
import { PaymentTransactionsModule } from '../payment-transactions/payment-transactions.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { BillingService } from './billing.service';
import { XenditWebhookController } from './xendit-webhook.controller';
import { MidtransWebhookController } from './midtrans-webhook.controller';

/**
 * BillingModule handles payment gateway webhook ingestion and reconciliation.
 *
 * Both webhook endpoints are PUBLIC — they do NOT use AuthGuard because
 * payment gateways cannot send Bearer tokens. Authentication is performed
 * via webhook signature validation inside each controller handler.
 *
 * Webhook routes:
 *   POST /webhooks/xendit   — Xendit invoice callbacks
 *   POST /webhooks/midtrans — Midtrans payment notifications
 *
 * Required environment variables (add to backend/.env):
 *   XENDIT_WEBHOOK_TOKEN=<from Xendit dashboard → Webhook settings>
 *   MIDTRANS_SERVER_KEY=<from Midtrans dashboard → Access Keys>
 */
@Module({
  imports: [PaymentTransactionsModule, SubscriptionsModule],
  controllers: [XenditWebhookController, MidtransWebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
