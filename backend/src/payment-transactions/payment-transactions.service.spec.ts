import { NotFoundException } from '@nestjs/common';
import { PaymentTransactionsService } from './payment-transactions.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { RecordTransactionInput } from './payment-transactions.service';

// ─── helpers ────────────────────────────────────────────────────────────────

type Op = 'insert' | 'update' | 'select' | 'upsert';
type Captured = { table: string; op: Op; payload?: unknown };

function buildSupabase(opts: {
  insertData?: Record<string, unknown> | null;
  findByGwTxId?: Record<string, unknown> | null;
  findById?: Record<string, unknown> | null;
  updateData?: Record<string, unknown> | null;
  listData?: Array<Record<string, unknown>> | null;
} = {}) {
  const captured: Captured[] = [];

  const from = jest.fn((table: string) => {
    return {
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: opts.insertData ?? { id: 'tx-1', ...(payload as object) },
              error: opts.insertData === null ? new Error('insert failed') : null,
            }),
          }),
        };
      },
      select: () => ({
        eq: (col: string, val: string) => ({
          maybeSingle: () => {
            if (col === 'gateway_tx_id') {
              return Promise.resolve({ data: opts.findByGwTxId, error: null });
            }
            if (col === 'id') {
              return Promise.resolve({ data: opts.findById, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
          single: () => Promise.resolve({ data: opts.findById, error: opts.findById === undefined ? new Error('not found') : null }),
          order: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
          }),
          // for listAll chaining
          eq: (col2: string, val2: unknown) => ({
            eq: () => ({
              eq: () => ({
                range: () => ({
                  then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
                }),
              }),
            }),
            range: () => ({
              then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
            }),
          }),
          range: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
          }),
        }),
        order: () => ({
          eq: () => ({
            order: () => ({
              then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
            }),
            then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
          }),
          then: (resolve: (v: unknown) => unknown) => resolve({ data: opts.listData ?? [], error: null }),
        }),
      }),
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: opts.updateData ?? { id: 'tx-1', ...(payload as object) },
                error: null,
              }),
            }),
          }),
        };
      },
    };
  });

  return {
    captured,
    supabase: { admin: { from } } as unknown as SupabaseService,
  };
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('PaymentTransactionsService.record', () => {
  it('inserts a new transaction row with correct fields', async () => {
    const { supabase, captured } = buildSupabase({ insertData: { id: 'tx-1' } });
    const service = new PaymentTransactionsService(supabase);

    const input: RecordTransactionInput = {
      user_id: 'user-1',
      type: 'subscription_new',
      gateway: 'xendit',
      amount: 100_000,
      subscription_id: 'sub-1',
      gateway_tx_id: 'gw-1',
      status: 'pending',
    };

    const result = await service.record(input);

    expect(result).toEqual({ id: 'tx-1' });
    const insertCall = captured.find((c) => c.op === 'insert');
    expect(insertCall).toBeDefined();
    const payload = insertCall!.payload as Record<string, unknown>;
    expect(payload.user_id).toBe('user-1');
    expect(payload.type).toBe('subscription_new');
    expect(payload.gateway).toBe('xendit');
    expect(payload.amount).toBe(100_000);
    expect(payload.subscription_id).toBe('sub-1');
    expect(payload.currency).toBe('IDR'); // default
  });

  it('defaults status to "pending" and currency to "IDR" when not provided', async () => {
    const { supabase, captured } = buildSupabase({ insertData: { id: 'tx-1' } });
    const service = new PaymentTransactionsService(supabase);

    await service.record({ user_id: 'u-1', type: 'in_app_payment', gateway: 'manual', amount: 50_000 });

    const payload = captured[0].payload as Record<string, unknown>;
    expect(payload.status).toBe('pending');
    expect(payload.currency).toBe('IDR');
  });
});

describe('PaymentTransactionsService.updateByGatewayTxId', () => {
  it('returns null when no transaction matches the gateway_tx_id', async () => {
    const { supabase } = buildSupabase({ findByGwTxId: null });
    const service = new PaymentTransactionsService(supabase);

    const result = await service.updateByGatewayTxId('unknown-gw', { status: 'paid' });
    expect(result).toBeNull();
  });

  it('updates and returns the transaction when found', async () => {
    const { supabase, captured } = buildSupabase({
      findByGwTxId: { id: 'tx-1', status: 'pending' },
      updateData: { id: 'tx-1', status: 'paid' },
    });
    const service = new PaymentTransactionsService(supabase);

    const result = await service.updateByGatewayTxId('gw-1', { status: 'paid', paid_at: '2026-01-01T00:00:00Z' });

    expect(result).toEqual({ id: 'tx-1', status: 'paid' });
    const updateCall = captured.find((c) => c.op === 'update');
    expect(updateCall).toBeDefined();
    const payload = updateCall!.payload as Record<string, unknown>;
    expect(payload.status).toBe('paid');
    expect(payload.paid_at).toBe('2026-01-01T00:00:00Z');
    expect(payload.updated_at).toBeDefined();
  });
});

describe('PaymentTransactionsService.findById', () => {
  it('throws NotFoundException when transaction not found', async () => {
    const from = jest.fn().mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
    });
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const service = new PaymentTransactionsService(supabase);

    await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns the transaction when found', async () => {
    const tx = { id: 'tx-1', type: 'subscription_new' };
    const from = jest.fn().mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: tx, error: null }) }) }),
    });
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const service = new PaymentTransactionsService(supabase);

    const result = await service.findById('tx-1');
    expect(result).toBe(tx);
  });
});

describe('PaymentTransactionsService.listMine', () => {
  it('returns transactions ordered by created_at descending', async () => {
    const txs = [{ id: 'tx-2' }, { id: 'tx-1' }];
    const from = jest.fn().mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: txs, error: null }),
          }),
        }),
      }),
    });
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const service = new PaymentTransactionsService(supabase);

    const result = await service.listMine('user-1');
    expect(result).toBe(txs);
  });
});
