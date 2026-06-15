import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { XenditWebhookController } from './xendit-webhook.controller';
import { BillingService } from './billing.service';

// ─── helpers ────────────────────────────────────────────────────────────────

const WEBHOOK_TOKEN = 'xendit-secret-token';

function makeBillingService(): jest.Mocked<Pick<BillingService, 'reconcile'>> {
  return { reconcile: jest.fn().mockResolvedValue(undefined) };
}

async function buildController(billingService: Pick<BillingService, 'reconcile'>) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [XenditWebhookController],
    providers: [
      {
        provide: ConfigService,
        useValue: { get: (key: string) => key === 'XENDIT_WEBHOOK_TOKEN' ? WEBHOOK_TOKEN : undefined },
      },
      { provide: BillingService, useValue: billingService },
    ],
  }).compile();

  return module.get<XenditWebhookController>(XenditWebhookController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('XenditWebhookController', () => {
  let controller: XenditWebhookController;
  let billingService: jest.Mocked<Pick<BillingService, 'reconcile'>>;

  beforeEach(async () => {
    billingService = makeBillingService();
    controller = await buildController(billingService);
  });

  describe('token validation', () => {
    it('throws UnauthorizedException when callback token is missing', async () => {
      await expect(controller.handle('', { external_id: 'tx-1', status: 'PAID' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when callback token is wrong', async () => {
      await expect(controller.handle('wrong-token', { external_id: 'tx-1', status: 'PAID' })).rejects.toThrow(UnauthorizedException);
    });

    it('accepts request with correct token', async () => {
      const result = await controller.handle(WEBHOOK_TOKEN, { external_id: 'tx-1', status: 'PAID', paid_at: null });
      expect(result).toEqual({ received: true });
    });
  });

  describe('status mapping', () => {
    async function callWithStatus(status: string) {
      await controller.handle(WEBHOOK_TOKEN, { external_id: 'tx-1', status, paid_at: null });
      return (billingService.reconcile as jest.Mock).mock.calls.at(-1)?.[0];
    }

    it('maps "PAID" to status "paid"', async () => {
      const arg = await callWithStatus('PAID');
      expect(arg.status).toBe('paid');
    });

    it('maps "SETTLED" to status "paid"', async () => {
      const arg = await callWithStatus('SETTLED');
      expect(arg.status).toBe('paid');
    });

    it('maps "EXPIRED" to status "expired"', async () => {
      const arg = await callWithStatus('EXPIRED');
      expect(arg.status).toBe('expired');
    });

    it('maps "FAILED" to status "failed"', async () => {
      const arg = await callWithStatus('FAILED');
      expect(arg.status).toBe('failed');
    });

    it('maps "PENDING" to status "pending"', async () => {
      const arg = await callWithStatus('PENDING');
      expect(arg.status).toBe('pending');
    });

    it('skips reconcile for unknown status', async () => {
      await controller.handle(WEBHOOK_TOKEN, { external_id: 'tx-1', status: 'SOME_WEIRD_STATUS' });
      expect(billingService.reconcile).not.toHaveBeenCalled();
    });
  });

  describe('payload format handling', () => {
    it('supports { event, data } nested format', async () => {
      const body = {
        event: 'invoice.paid',
        data: { external_id: 'tx-nested', status: 'PAID', paid_at: '2026-01-01T00:00:00Z' },
      };
      await controller.handle(WEBHOOK_TOKEN, body);
      const arg = (billingService.reconcile as jest.Mock).mock.calls[0]?.[0];
      expect(arg.gatewayTxId).toBe('tx-nested');
      expect(arg.status).toBe('paid');
    });

    it('supports flat payload format (no event wrapper)', async () => {
      const body = { external_id: 'tx-flat', status: 'EXPIRED' };
      await controller.handle(WEBHOOK_TOKEN, body);
      const arg = (billingService.reconcile as jest.Mock).mock.calls[0]?.[0];
      expect(arg.gatewayTxId).toBe('tx-flat');
      expect(arg.status).toBe('expired');
    });

    it('returns { received: true } without calling reconcile when external_id is missing', async () => {
      await controller.handle(WEBHOOK_TOKEN, { status: 'PAID' });
      expect(billingService.reconcile).not.toHaveBeenCalled();
    });
  });

  describe('paidAt handling', () => {
    it('passes paidAt when status is paid', async () => {
      const body = { external_id: 'tx-1', status: 'PAID', paid_at: '2026-06-15T10:00:00Z' };
      await controller.handle(WEBHOOK_TOKEN, body);
      const arg = (billingService.reconcile as jest.Mock).mock.calls[0]?.[0];
      expect(arg.paidAt).toBe('2026-06-15T10:00:00Z');
    });

    it('passes null paidAt for non-paid status', async () => {
      const body = { external_id: 'tx-1', status: 'EXPIRED', paid_at: '2026-01-01T00:00:00Z' };
      await controller.handle(WEBHOOK_TOKEN, body);
      const arg = (billingService.reconcile as jest.Mock).mock.calls[0]?.[0];
      expect(arg.paidAt).toBeNull();
    });
  });

  describe('error handling', () => {
    it('returns { received: true } even when reconcile throws', async () => {
      billingService.reconcile = jest.fn().mockRejectedValue(new Error('db error'));
      const result = await controller.handle(WEBHOOK_TOKEN, { external_id: 'tx-1', status: 'PAID' });
      expect(result).toEqual({ received: true });
    });
  });
});
