import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import type { TransactionStatus } from '../common/types/schema.types';

// Signature secrets read from env: XENDIT_WEBHOOK_TOKEN, MIDTRANS_SERVER_KEY.
// Set in backend/.env.example.

/**
 * Maps Xendit invoice status strings to internal TransactionStatus values.
 */
function mapXenditStatus(xenditStatus: string): TransactionStatus | null {
  switch (xenditStatus.toLowerCase()) {
    case 'paid':
    case 'settled':
      return 'paid';
    case 'expired':
      return 'expired';
    case 'failed':
      return 'failed';
    case 'pending':
      return 'pending';
    default:
      return null;
  }
}

@Controller('webhooks/xendit')
export class XenditWebhookController {
  private readonly logger = new Logger(XenditWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly billingService: BillingService,
  ) {}

  /**
   * Handles Xendit invoice webhook callbacks.
   *
   * Supported events: invoice.paid, invoice.expired, invoice.failed
   *
   * Authentication: validates the x-callback-token header against
   * the XENDIT_WEBHOOK_TOKEN environment variable.
   *
   * Always returns { received: true } after signature validation —
   * Xendit retries if it receives a non-2xx response. Downstream errors
   * are logged but do not cause a non-2xx response to avoid infinite retries.
   *
   * Xendit payload shape (relevant fields):
   *   {
   *     event:       "invoice.paid" | "invoice.expired" | "invoice.failed",
   *     data: {
   *       id:         string,          // Xendit invoice ID
   *       external_id: string,         // your gateway_tx_id
   *       status:      string,         // "PAID" | "EXPIRED" | "FAILED"
   *       paid_at:     string | null,  // ISO timestamp
   *       ...
   *     }
   *   }
   */
  @Post()
  @HttpCode(200)
  async handle(
    @Headers('x-callback-token') callbackToken: string,
    @Body() body: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    // ── Signature validation ────────────────────────────────────────
    const expectedToken = this.config.get<string>('XENDIT_WEBHOOK_TOKEN');
    if (!expectedToken || callbackToken !== expectedToken) {
      throw new UnauthorizedException('Invalid Xendit webhook token');
    }

    // ── Event parsing ───────────────────────────────────────────────
    try {
      const event = (body.event as string) ?? '';
      const data = (body.data ?? body) as Record<string, unknown>;

      // Handle top-level payload format (no event wrapper) as well as
      // the newer { event, data } format
      const externalId =
        (data.external_id as string) ?? (body.external_id as string);
      const rawStatus =
        (data.status as string) ?? (body.status as string) ?? '';
      const paidAt =
        (data.paid_at as string | null) ?? (body.paid_at as string | null) ?? null;

      if (!externalId) {
        this.logger.warn('Xendit webhook missing external_id, skipping', { event });
        return { received: true };
      }

      const status = mapXenditStatus(rawStatus);
      if (!status) {
        this.logger.warn(
          `Xendit webhook with unrecognised status '${rawStatus}' for tx ${externalId}`,
        );
        return { received: true };
      }

      await this.billingService.reconcile({
        gatewayTxId: externalId,
        status,
        gatewayStatus: rawStatus,
        gatewayPayload: body,
        paidAt: status === 'paid' ? paidAt : null,
      });
    } catch (err) {
      // Log but still return 200 — Xendit must not retry on application errors
      this.logger.error(`Error processing Xendit webhook: ${String(err)}`);
    }

    return { received: true };
  }
}
