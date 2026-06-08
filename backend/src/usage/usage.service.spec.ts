import { UsageService } from './usage.service';
import { SupabaseService } from '../supabase/supabase.service';

function buildSupabase(opts: {
  upsertData?: Record<string, unknown> | null;
  existingRow?: Record<string, unknown> | null;
  rpcError?: boolean;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      single: () =>
        Promise.resolve({
          data: opts.existingRow ?? { user_id: 'u-1', period_month: '2026-06-01', groups_created: 2, bills_created: 5 },
          error: null,
        }),
    });

    return {
      select: () => chain(),
      upsert: (payload: unknown) => {
        captured.push({ table, op: 'upsert', payload });
        return {
          select: () => ({
            single: () =>
              Promise.resolve({
                data: opts.upsertData ?? null, // null simulates ignoreDuplicates conflict
                error: null,
              }),
          }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            eq: () => ({
              then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
            }),
          }),
        };
      },
    };
  });

  const rpc = jest.fn((_fn: string, _args: unknown) =>
    Promise.resolve({
      data: null,
      error: opts.rpcError ? { message: 'rpc not found' } : null,
    }),
  );

  return { captured, supabase: { admin: { from, rpc } } as unknown as SupabaseService };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UsageService.getCurrent', () => {
  it('returns upserted row when created fresh', async () => {
    const { supabase } = buildSupabase({
      upsertData: { user_id: 'u-1', period_month: '2026-06-01', groups_created: 0, bills_created: 0 },
    });
    const svc = new UsageService(supabase);
    const result = await svc.getCurrent('u-1');
    expect(result.user_id).toBe('u-1');
  });

  it('falls back to select when upsert returns null (ignoreDuplicates conflict)', async () => {
    const { supabase } = buildSupabase({
      upsertData: null, // ignoreDuplicates returns null on conflict
      existingRow: { user_id: 'u-1', period_month: '2026-06-01', groups_created: 3, bills_created: 1 },
    });
    const svc = new UsageService(supabase);
    const result = await svc.getCurrent('u-1');
    expect(result.groups_created).toBe(3);
  });
});

describe('UsageService.incrementGroups', () => {
  it('calls the increment_usage_groups RPC', async () => {
    const { supabase } = buildSupabase({ upsertData: null });
    const svc = new UsageService(supabase);
    await svc.incrementGroups('u-1');
    expect((supabase.admin as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith(
      'increment_usage_groups',
      expect.objectContaining({ p_user_id: 'u-1' }),
    );
  });

  it('falls back to read-then-update when RPC errors', async () => {
    const { supabase, captured } = buildSupabase({ upsertData: null, rpcError: true });
    const svc = new UsageService(supabase);
    await svc.incrementGroups('u-1');
    // Should have issued an update as fallback
    const update = captured.find((c) => c.op === 'update' && c.table === 'usage_tracking');
    expect(update).toBeDefined();
    const payload = update!.payload as { groups_created: number };
    expect(payload.groups_created).toBe(3); // existingRow has 2, fallback adds 1 → 3
  });
});

describe('UsageService.incrementBills', () => {
  it('calls the increment_usage_bills RPC', async () => {
    const { supabase } = buildSupabase({ upsertData: null });
    const svc = new UsageService(supabase);
    await svc.incrementBills('u-1');
    expect((supabase.admin as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith(
      'increment_usage_bills',
      expect.objectContaining({ p_user_id: 'u-1' }),
    );
  });

  it('falls back to read-then-update when RPC errors', async () => {
    const { supabase, captured } = buildSupabase({ upsertData: null, rpcError: true });
    const svc = new UsageService(supabase);
    await svc.incrementBills('u-1');
    const update = captured.find((c) => c.op === 'update' && c.table === 'usage_tracking');
    expect(update).toBeDefined();
    const payload = update!.payload as { bills_created: number };
    expect(payload.bills_created).toBe(6); // existingRow has 5, fallback adds 1 → 6
  });
});

describe('UsageService.resetMonth', () => {
  it('resolves without doing any DB operation (no-op)', async () => {
    const { supabase, captured } = buildSupabase({});
    const svc = new UsageService(supabase);
    await svc.resetMonth(new Date());
    expect(captured).toHaveLength(0);
  });
});
