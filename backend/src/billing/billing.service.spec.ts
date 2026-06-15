import { BillingService } from './billing.service';
import { PaymentTransactionsService } from '../payment-transactions/payment-transactions.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { WebhookReconcileInput } from './billing.service';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeTxService(): jest.Mocked<Pick<PaymentTransactionsService, 'updateByGatewayTxId'>> {
  return { updateByGatewayTxId: jest.fn() };
}

function makeSubService(): jest.Mocked<Pick<SubscriptionsService, 'activateAndExtendUserSub' | 'activateAndExtendGroupSub'>> {
  return {
    activateAndExtendUserSub: jest.fn().mockResolvedValue(undefined),
    activateAndExtendGroupSub: jest.fn().mockResolvedValue(undefined),
  };
}

function makeSupabase(billingCycle: string | null = 'monthly') {
  const maybeSingle = jest.fn().mockResolvedValue({ data: billingCycle ? { billing_cycle: billingCycle } : null, error: null });
  const from = jest.fn().mockReturnValue({
    select: () => ({ eq: () => ({ maybeSingle }) }),
  });
  return { admin: { from } } as unknown as SupabaseService;
}

function buildService(
  opts: {
    txResult?: Record<string, unknown> | null;
    billingCycle?: string | null;
  } = {},
) {
  const txService = makeTxService();
  txService.updateByGatewayTxId.mockResolvedValue((opts.txResult ?? null) as never);

  const subService = makeSubService();
  const supabase = makeSupabase(opts.billingCycle !== undefined ? opts.billingCycle : 'monthly');

  const service = new BillingService(
    supabase,
    txService as unknown as PaymentTransactionsService,
    subService as unknown as SubscriptionsService,
  );

  return { service, txService, subService };
}

const baseInput: WebhookReconcileInput = {
  gatewayTxId: 'gw-tx-1',
  status: 'paid',
  gatewayStatus: 'settlement',
  gatewayPayload: { order_id: 'gw-tx-1' },
  paidAt: '2026-01-01T00:00:00Z',
};

// ─── tests ──────────────────────────────────────────────────────────────────

describe('BillingService.reconcile', () => {
  it('calls updateByGatewayTxId with the correct patch', async () => {
    const { service, txService } = buildService({ txResult: null });
    await service.reconcile(baseInput);
    expect(txService.updateByGatewayTxId).toHaveBeenCalledWith('gw-tx-1', {
      status: 'paid',
      gateway_status: 'settlement',
      gateway_payload: baseInput.gatewayPayload,
      paid_at: '2026-01-01T00:00:00Z',
    });
  });

  it('returns early without activating subscriptions when tx is not found', async () => {
    const { service, subService } = buildService({ txResult: null });
    await service.reconcile(baseInput);
    expect(subService.activateAndExtendUserSub).not.toHaveBeenCalled();
    expect(subService.activateAndExtendGroupSub).not.toHaveBeenCalled();
  });

  it('returns early without activating subscriptions when status is not "paid"', async () => {
    const tx = { id: 'tx-1', type: 'subscription_new', subscription_id: 'sub-1', group_subscription_id: null };
    const { service, subService } = buildService({ txResult: tx });
    await service.reconcile({ ...baseInput, status: 'pending' });
    expect(subService.activateAndExtendUserSub).not.toHaveBeenCalled();
  });

  it('returns early without activating subscriptions when type is not subscription type', async () => {
    const tx = { id: 'tx-1', type: 'in_app_payment', subscription_id: null, group_subscription_id: null };
    const { service, subService } = buildService({ txResult: tx });
    await service.reconcile(baseInput);
    expect(subService.activateAndExtendUserSub).not.toHaveBeenCalled();
    expect(subService.activateAndExtendGroupSub).not.toHaveBeenCalled();
  });

  it('activates user subscription when tx is subscription_new with subscription_id', async () => {
    const tx = { id: 'tx-1', type: 'subscription_new', subscription_id: 'sub-1', group_subscription_id: null };
    const { service, subService } = buildService({ txResult: tx, billingCycle: 'monthly' });
    await service.reconcile(baseInput);
    expect(subService.activateAndExtendUserSub).toHaveBeenCalledWith('sub-1', 'monthly');
  });

  it('activates group subscription when tx has group_subscription_id', async () => {
    const tx = { id: 'tx-1', type: 'subscription_renewal', subscription_id: null, group_subscription_id: 'gsub-1' };
    const { service, subService } = buildService({ txResult: tx, billingCycle: 'yearly' });
    await service.reconcile(baseInput);
    expect(subService.activateAndExtendGroupSub).toHaveBeenCalledWith('gsub-1', 'yearly');
  });

  it('skips activation when billing_cycle row does not exist', async () => {
    const tx = { id: 'tx-1', type: 'subscription_new', subscription_id: 'sub-1', group_subscription_id: null };
    const { service, subService } = buildService({ txResult: tx, billingCycle: null });
    await service.reconcile(baseInput);
    expect(subService.activateAndExtendUserSub).not.toHaveBeenCalled();
  });

  it('handles subscription_upgrade type for user subscription', async () => {
    const tx = { id: 'tx-1', type: 'subscription_upgrade', subscription_id: 'sub-2', group_subscription_id: null };
    const { service, subService } = buildService({ txResult: tx, billingCycle: 'yearly' });
    await service.reconcile(baseInput);
    expect(subService.activateAndExtendUserSub).toHaveBeenCalledWith('sub-2', 'yearly');
  });
});
