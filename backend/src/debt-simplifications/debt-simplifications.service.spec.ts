import { Test } from '@nestjs/testing';
import { DebtSimplificationsService } from './debt-simplifications.service';
import { SupabaseService } from '../supabase/supabase.service';

// ─────────────────────────────────────────────────────────────────
// Mock supabase chain
// ─────────────────────────────────────────────────────────────────
// We build a tiny fluent stub. Each .from(table) returns an object that
// supports the methods this service uses. Tests configure return values
// per (table, op) tuple ahead of time.

function buildStub() {
  const responses = new Map<string, { data: unknown; error: unknown }>();
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const setResponse = (key: string, data: unknown, error: unknown = null) => {
    responses.set(key, { data, error });
  };

  const adminFrom = (table: string) => {
    const filter = (op: string) => ({
      eq: () => filter(op),
      neq: () => filter(op),
      order: () => filter(op),
      maybeSingle: () =>
        Promise.resolve(responses.get(`${table}:${op}`) ?? { data: null, error: null }),
      single: () =>
        Promise.resolve(responses.get(`${table}:${op}`) ?? { data: null, error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        resolve(responses.get(`${table}:${op}`) ?? { data: [], error: null }),
    });
    return {
      select: () => filter('select'),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          select: () => ({
            single: () =>
              Promise.resolve(
                responses.get(`${table}:insert`) ?? { data: payload, error: null },
              ),
            then: (resolve: (v: unknown) => unknown) =>
              resolve(
                responses.get(`${table}:insert`) ?? { data: payload, error: null },
              ),
          }),
          then: (resolve: (v: unknown) => unknown) =>
            resolve(
              responses.get(`${table}:insert`) ?? { data: payload, error: null },
            ),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            eq: () => ({
              then: (resolve: (v: unknown) => unknown) =>
                resolve(
                  responses.get(`${table}:update`) ?? { data: null, error: null },
                ),
            }),
            select: () => ({
              single: () =>
                Promise.resolve(
                  responses.get(`${table}:update`) ?? { data: payload, error: null },
                ),
            }),
            then: (resolve: (v: unknown) => unknown) =>
              resolve(
                responses.get(`${table}:update`) ?? { data: null, error: null },
              ),
          }),
        };
      },
      delete: () => {
        captured.push({ table, op: 'delete' });
        return {
          eq: () => ({
            eq: () => ({
              then: (resolve: (v: unknown) => unknown) =>
                resolve(
                  responses.get(`${table}:delete`) ?? { data: null, error: null },
                ),
            }),
            then: (resolve: (v: unknown) => unknown) =>
              resolve(
                responses.get(`${table}:delete`) ?? { data: null, error: null },
              ),
          }),
        };
      },
    };
  };

  return {
    setResponse,
    captured,
    supabase: { admin: { from: adminFrom } } as unknown as SupabaseService,
  };
}

describe('DebtSimplificationsService.simplifyBill', () => {
  let stub: ReturnType<typeof buildStub>;
  let service: DebtSimplificationsService;

  beforeEach(async () => {
    stub = buildStub();
    const moduleRef = await Test.createTestingModule({
      providers: [
        DebtSimplificationsService,
        { provide: SupabaseService, useValue: stub.supabase },
      ],
    }).compile();
    service = moduleRef.get(DebtSimplificationsService);

    // Access checks: requireBillAccess uses `bills:select` (maybeSingle).
    // Caller is always the payer in these tests for simplicity.
    stub.setResponse('bills:select', { paid_by: 'payer' });
  });

  it('produces one edge per non-payer when payer fronted the whole bill', async () => {
    // payer fronted 100k, three others each owe 25k, payer's own share is 25k
    stub.setResponse('bill_splits:select', [
      { user_id: 'payer', amount_owed: 25_000, is_payer: true },
      { user_id: 'A', amount_owed: 25_000, is_payer: false },
      { user_id: 'B', amount_owed: 25_000, is_payer: false },
      { user_id: 'C', amount_owed: 25_000, is_payer: false },
    ]);

    await service.simplifyBill('bill-1', 'payer');

    const insertCall = stub.captured.find(
      (c) => c.table === 'debt_simplifications' && c.op === 'insert',
    );
    expect(insertCall).toBeDefined();
    const rows = insertCall!.payload as Array<{
      from_user_id: string;
      to_user_id: string;
      amount: number;
    }>;

    // Three transfers, each → payer
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.to_user_id === 'payer')).toBe(true);
    expect(rows.every((r) => r.amount === 25_000)).toBe(true);
    expect(new Set(rows.map((r) => r.from_user_id))).toEqual(new Set(['A', 'B', 'C']));

    // Total transferred = total amount minus payer's own share
    const total = rows.reduce((s, r) => s + r.amount, 0);
    expect(total).toBe(75_000);
  });

  it('returns no edges for a single-participant bill (payer only)', async () => {
    stub.setResponse('bill_splits:select', [
      { user_id: 'payer', amount_owed: 100_000, is_payer: true },
    ]);

    const result = await service.simplifyBill('bill-1', 'payer');
    expect(result).toEqual([]);
  });

  it('handles uneven splits correctly', async () => {
    // payer fronted 100k. A owes 70k, B owes 20k. Payer's share = 10k.
    stub.setResponse('bill_splits:select', [
      { user_id: 'payer', amount_owed: 10_000, is_payer: true },
      { user_id: 'A', amount_owed: 70_000, is_payer: false },
      { user_id: 'B', amount_owed: 20_000, is_payer: false },
    ]);

    await service.simplifyBill('bill-1', 'payer');

    const insertCall = stub.captured.find(
      (c) => c.table === 'debt_simplifications' && c.op === 'insert',
    );
    const rows = insertCall!.payload as Array<{
      from_user_id: string;
      to_user_id: string;
      amount: number;
    }>;

    expect(rows).toHaveLength(2);
    const aEdge = rows.find((r) => r.from_user_id === 'A')!;
    const bEdge = rows.find((r) => r.from_user_id === 'B')!;
    expect(aEdge.to_user_id).toBe('payer');
    expect(aEdge.amount).toBe(70_000);
    expect(bEdge.to_user_id).toBe('payer');
    expect(bEdge.amount).toBe(20_000);
  });

  it('deletes prior pending simplifications before inserting fresh ones', async () => {
    stub.setResponse('bill_splits:select', [
      { user_id: 'payer', amount_owed: 50_000, is_payer: true },
      { user_id: 'A', amount_owed: 50_000, is_payer: false },
    ]);

    await service.simplifyBill('bill-1', 'payer');

    const deleteCall = stub.captured.find(
      (c) => c.table === 'debt_simplifications' && c.op === 'delete',
    );
    expect(deleteCall).toBeDefined();

    // Delete must happen before insert
    const deleteIdx = stub.captured.findIndex(
      (c) => c.table === 'debt_simplifications' && c.op === 'delete',
    );
    const insertIdx = stub.captured.findIndex(
      (c) => c.table === 'debt_simplifications' && c.op === 'insert',
    );
    expect(deleteIdx).toBeLessThan(insertIdx);
  });
});
