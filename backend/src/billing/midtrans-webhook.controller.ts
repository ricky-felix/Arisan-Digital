import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { BillingService } from './billing.service';
import type { TransactionStatus } from '../common/types/schema.types';

// Signature secrets read from env: XENDIT_WEBHOOK_TOKEN, MIDTRANS_SERVER_KEY.
// Set in backend/.env.example.

/**
 * Maps Midtrans transaction_status values to internal TransactionStatus values.
 *
 * Midtrans status reference:
 *   settlement / capture → paid  (card payments use 'capture')
 *   pending              → pending
 *   expire               → expired
 *   deny / cancel / failure → failed
 */
function mapMidtransStatus(txStatus: string): TransactionStatus {
  switch (txStatus.toLowerCase()) {
    case 'settlement':
    case 'capture':
      return 'paid';
    case 'expire':
      return 'expired';
    case 'deny':
    case 'cancel':
    case 'failure':
      return 'failed';
    case 'pending':
    default:
      return 'pending';
  }
}

@Controller('webhooks/midtrans')
export class MidtransWebhookController {
  private readonly logger = new Logger(MidtransWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly billingService: BillingService,
  ) {}

  /**
   * Handles Midtrans payment notification webhooks.
   *
   * Authentication: validates the signature_key field in the payload.
   * Midtrans signature: SHA-512(order_id + status_code + gross_amount + ServerKey)
   *
   * Always returns { received: true } after signature validation.
   *
   * Midtrans payload shape (relevant fields):
   *   {
   *     order_id:           string,   // your gateway_tx_id
   *     transaction_status: string,   // "settlement" | "pending" | "expire" | etc.
   *     status_code:        string,   // "200" | "201" | etc.
   *     gross_amount:       string,   // "50000.00"
   *     signature_key:      string,   // SHA-512 signature
   *     settlement_time:    string | null,
   *   }
   */
  @Post()
  @HttpCode(200)
  async handle(
    @Body() body: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    // ── Signature validation ────────────────────────────────────────
    const serverKey = this.config.get<string>('MIDTRANS_SERVER_KEY') ?? '';
    const orderId = (body.order_id as string) ?? '';
    const statusCode = (body.status_code as string) ?? '';
    const grossAmount = (body.gross_amount as string) ?? '';
    const receivedSignature = (body.signature_key as string) ?? '';

    const expectedSignature = createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    if (expectedSignature !== receivedSignature) {
      throw new UnauthorizedException('Invalid Midtrans signature');
    }

    // ── Event processing ────────────────────────────────────────────
    try {
      const txStatus = (body.transaction_status as string) ?? '';
      const settlementTime = (body.settlement_time as string | null) ?? null;
      const status = mapMidtransStatus(txStatus);

      if (!orderId) {
        this.logger.warn('Midtrans webhook missing order_id, skipping');
        return { received: true };
      }

      await this.billingService.reconcile({
        gatewayTxId: orderId,
        status,
        gatewayStatus: txStatus,
        gatewayPayload: body,
        paidAt: status === 'paid' ? settlementTime : null,
      });
    } catch (err) {
      // Log but return 200 — Midtrans retries on non-2xx responses
      this.logger.error(`Error processing Midtrans webhook: ${String(err)}`);
    }

    return { received: true };
  }
}
