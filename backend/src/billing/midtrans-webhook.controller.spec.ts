import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { MidtransWebhookController } from './midtrans-webhook.controller';
import { BillingService } from './billing.service';

// ─── helpers ────────────────────────────────────────────────────────────────

const SERVER_KEY = 'test-server-key';

function makeSignature(orderId: string, statusCode: string, grossAmount: string): string {
  return createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${SERVER_KEY}`)
    .digest('hex');
}

function makeBillingService(): jest.Mocked<Pick<BillingService, 'reconcile'>> {
  return { reconcile: jest.fn().mockResolvedValue(undefined) };
}

async function buildController(billingService: Pick<BillingService, 'reconcile'>) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [MidtransWebhookController],
    providers: [
      { provide: ConfigService, useValue: { get: (key: string) => key === 'MIDTRANS_SERVER_KEY' ? SERVER_KEY : undefined } },
      { provide: BillingService, useValue: billingService },
    ],
  }).compile();

  return module.get<MidtransWebhookController>(MidtransWebhookController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('MidtransWebhookController', () => {
  let controller: MidtransWebhookController;
  let billingService: jest.Mocked<Pick<BillingService, 'reconcile'>>;

  beforeEach(async () => {
    billingService = makeBillingService();
    controller = await buildController(billingService);
  });

  describe('signature validation', () => {
    it('throws UnauthorizedException when signature_key is invalid', async () => {
      const body = {
        order_id: 'ord-1',
        status_code: '200',
        gross_amount: '50000.00',
        signature_key: 'bad-sig',
        transaction_status: 'settlement',
      };
      await expect(controller.handle(body)).rejects.toThrow(UnauthorizedException);
    });

    it('accepts a request with a valid signature', async () => {
      const orderId = 'ord-valid';
      const statusCode = '200';
      const grossAmount = '100000.00';
      const sig = makeSignature(orderId, statusCode, grossAmount);

      const body = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: sig,
        transaction_status: 'settlement',
        settlement_time: '2026-01-01T12:00:00Z',
      };

      const result = await controller.handle(body);
      expect(result).toEqual({ received: true });
      expect(billingService.reconcile).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
    });
  });

  describe('status mapping', () => {
    async function callWithStatus(txStatus: string) {
      const orderId = 'ord-1';
      const statusCode = '200';
      const grossAmount = '1000.00';
      const sig = makeSignature(orderId, statusCode, grossAmount);
      const body = { order_id: orderId, status_code: statusCode, gross_amount: grossAmount, signature_key: sig, transaction_status: txStatus };
      await controller.handle(body);
      return (billingService.reconcile as jest.Mock).mock.calls.at(-1)?.[0];
    }

    it('maps "settlement" to status "paid"', async () => {
      const arg = await callWithStatus('settlement');
      expect(arg.status).toBe('paid');
    });

    it('maps "capture" to status "paid"', async () => {
      const arg = await callWithStatus('capture');
      expect(arg.status).toBe('paid');
    });

    it('maps "pending" to status "pending"', async () => {
      const arg = await callWithStatus('pending');
      expect(arg.status).toBe('pending');
    });

    it('maps "expire" to status "expired"', async () => {
      const arg = await callWithStatus('expire');
      expect(arg.status).toBe('expired');
    });

    it('maps "deny" to status "failed"', async () => {
      const arg = await callWithStatus('deny');
      expect(arg.status).toBe('failed');
    });

    it('maps "cancel" to status "failed"', async () => {
      const arg = await callWithStatus('cancel');
      expect(arg.status).toBe('failed');
    });

    it('maps "failure" to status "failed"', async () => {
      const arg = await callWithStatus('failure');
      expect(arg.status).toBe('failed');
    });

    it('maps unknown status to "pending"', async () => {
      const arg = await callWithStatus('unknown_value');
      expect(arg.status).toBe('pending');
    });
  });

  describe('missing order_id', () => {
    it('returns { received: true } without calling reconcile when order_id is empty', async () => {
      const statusCode = '200';
      const grossAmount = '1000.00';
      // Sign with empty order_id
      const sig = makeSignature('', statusCode, grossAmount);
      const body = { order_id: '', status_code: statusCode, gross_amount: grossAmount, signature_key: sig, transaction_status: 'settlement' };

      const result = await controller.handle(body);

      expect(result).toEqual({ received: true });
      expect(billingService.reconcile).not.toHaveBeenCalled();
    });
  });

  describe('reconcile error handling', () => {
    it('returns { received: true } even if reconcile throws', async () => {
      billingService.reconcile = jest.fn().mockRejectedValue(new Error('db error'));
      const orderId = 'ord-err';
      const statusCode = '200';
      const grossAmount = '500.00';
      const sig = makeSignature(orderId, statusCode, grossAmount);
      const body = { order_id: orderId, status_code: statusCode, gross_amount: grossAmount, signature_key: sig, transaction_status: 'settlement' };

      const result = await controller.handle(body);
      expect(result).toEqual({ received: true });
    });
  });
});
