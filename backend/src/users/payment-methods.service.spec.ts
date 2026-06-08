import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { PaymentMethodV1 } from '../common/types/schema.types';
import { PaymentMethodType } from './dto/create-payment-method.dto';

// ─── Helper to make a v1 payment method ──────────────────────────────────────

function makeMethod(overrides: Partial<PaymentMethodV1> = {}): PaymentMethodV1 {
  return {
    id: `pm_${Math.random().toString(36).slice(2)}`,
    type: PaymentMethodType.GOPAY,
    label: 'GoPay Utama',
    account_number: null,
    holder_name: null,
    phone: '081234567890',
    qris_image_path: null,
    is_primary: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ─── Supabase stub ────────────────────────────────────────────────────────────

function buildSupabase(opts: {
  userRow?: Record<string, unknown> | null;      // full users row including payment_methods
  targetRow?: Record<string, unknown> | null;    // for listForPeer target user lookup
  requesterGroups?: Array<{ group_id: string }>; // for co-member check
  targetGroups?: Array<{ group_id: string }>;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];
  let callCount = 0;

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      in: () => chain(),
      single: () => {
        // First call: target user lookup, subsequent: payment_methods read
        const row =
          callCount === 0 && opts.targetRow !== undefined
            ? opts.targetRow
            : opts.userRow ?? { id: 'u-1', payment_methods: [], platform_role: 'user' };
        callCount++;
        return Promise.resolve({ data: row, error: row ? null : new Error('not found') });
      },
      maybeSingle: () => Promise.resolve({ data: null }),
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'group_members') {
          // Alternate between requester and target group lookups
          const data =
            callCount % 2 === 0
              ? opts.requesterGroups ?? []
              : opts.targetGroups ?? [];
          callCount++;
          return resolve({ data, error: null });
        }
        return resolve({ data: [], error: null });
      },
    });

    return {
      select: () => chain(),
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
          }),
        };
      },
    };
  });

  return { captured, supabase: { admin: { from } } as unknown as SupabaseService };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentMethodsService.listOwn', () => {
  it('returns empty array when user has no payment methods', async () => {
    const { supabase } = buildSupabase({ userRow: { id: 'u-1', payment_methods: [] } });
    const svc = new PaymentMethodsService(supabase);
    const result = await svc.listOwn('u-1');
    expect(result.data).toEqual([]);
  });

  it('returns v1 methods array', async () => {
    const methods = [makeMethod({ is_primary: true })];
    const { supabase } = buildSupabase({ userRow: { id: 'u-1', payment_methods: methods } });
    const svc = new PaymentMethodsService(supabase);
    const result = await svc.listOwn('u-1');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].is_primary).toBe(true);
  });

  it('returns empty array for v0 legacy string[] format', async () => {
    // v0 format is a string[] — should be treated as empty v1
    const { supabase } = buildSupabase({
      userRow: { id: 'u-1', payment_methods: ['BCA - 123', 'GoPay - 081'] },
    });
    const svc = new PaymentMethodsService(supabase);
    const result = await svc.listOwn('u-1');
    expect(result.data).toEqual([]);
  });
});

describe('PaymentMethodsService.create', () => {
  it('creates a new payment method and appends it', async () => {
    const { supabase, captured } = buildSupabase({ userRow: { id: 'u-1', payment_methods: [] } });
    const svc = new PaymentMethodsService(supabase);
    const created = await svc.create('u-1', {
      type: PaymentMethodType.GOPAY,
      label: 'GoPay Utama',
      phone: '081234567890',
      is_primary: false,
    });

    expect(created.type).toBe(PaymentMethodType.GOPAY);
    expect(created.label).toBe('GoPay Utama');
    expect(created.id).toMatch(/^pm_/);

    const update = captured.find((c) => c.op === 'update');
    expect(update).toBeDefined();
    const saved = (update!.payload as { payment_methods: PaymentMethodV1[] }).payment_methods;
    expect(saved).toHaveLength(1);
  });

  it('demotes existing primary methods when new method is_primary=true', async () => {
    const existingPrimary = makeMethod({ id: 'pm_old', is_primary: true });
    const { supabase, captured } = buildSupabase({
      userRow: { id: 'u-1', payment_methods: [existingPrimary] },
    });
    const svc = new PaymentMethodsService(supabase);
    await svc.create('u-1', {
      type: PaymentMethodType.OVO,
      label: 'OVO Main',
      phone: '081111111111',
      is_primary: true,
    });

    const update = captured.find((c) => c.op === 'update');
    const saved = (update!.payload as { payment_methods: PaymentMethodV1[] }).payment_methods;
    // old one should be demoted
    expect(saved.find((m) => m.id === 'pm_old')!.is_primary).toBe(false);
    // new one should be primary
    const newM = saved.find((m) => m.label === 'OVO Main');
    expect(newM).toBeDefined();
    expect(newM!.is_primary).toBe(true);
  });
});

describe('PaymentMethodsService.update', () => {
  const method = makeMethod({ id: 'pm_abc', label: 'BCA', is_primary: false });

  it('throws NotFoundException when method id is not found', async () => {
    const { supabase } = buildSupabase({ userRow: { id: 'u-1', payment_methods: [method] } });
    const svc = new PaymentMethodsService(supabase);
    await expect(svc.update('u-1', 'pm_nonexistent', { label: 'New' })).rejects.toThrow(NotFoundException);
  });

  it('updates the specified method and returns updated object', async () => {
    const { supabase, captured } = buildSupabase({ userRow: { id: 'u-1', payment_methods: [method] } });
    const svc = new PaymentMethodsService(supabase);
    const updated = await svc.update('u-1', 'pm_abc', { label: 'BNI' });
    expect(updated.label).toBe('BNI');

    const persistUpdate = captured.find((c) => c.op === 'update');
    const saved = (persistUpdate!.payload as { payment_methods: PaymentMethodV1[] }).payment_methods;
    expect(saved.find((m) => m.id === 'pm_abc')!.label).toBe('BNI');
  });

  it('demotes other methods when promoting to primary', async () => {
    const m1 = makeMethod({ id: 'pm_1', is_primary: true });
    const m2 = makeMethod({ id: 'pm_2', is_primary: false });
    const { supabase, captured } = buildSupabase({
      userRow: { id: 'u-1', payment_methods: [m1, m2] },
    });
    const svc = new PaymentMethodsService(supabase);
    await svc.update('u-1', 'pm_2', { is_primary: true });

    const persistUpdate = captured.find((c) => c.op === 'update');
    const saved = (persistUpdate!.payload as { payment_methods: PaymentMethodV1[] }).payment_methods;
    expect(saved.find((m) => m.id === 'pm_1')!.is_primary).toBe(false);
    expect(saved.find((m) => m.id === 'pm_2')!.is_primary).toBe(true);
  });
});

describe('PaymentMethodsService.delete', () => {
  it('throws NotFoundException when method id is not found', async () => {
    const method = makeMethod({ id: 'pm_x' });
    const { supabase } = buildSupabase({ userRow: { id: 'u-1', payment_methods: [method] } });
    const svc = new PaymentMethodsService(supabase);
    await expect(svc.delete('u-1', 'pm_nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('removes the method from the array', async () => {
    const method = makeMethod({ id: 'pm_del', is_primary: false });
    const { supabase, captured } = buildSupabase({ userRow: { id: 'u-1', payment_methods: [method] } });
    const svc = new PaymentMethodsService(supabase);
    await svc.delete('u-1', 'pm_del');
    const persistUpdate = captured.find((c) => c.op === 'update');
    const saved = (persistUpdate!.payload as { payment_methods: PaymentMethodV1[] }).payment_methods;
    expect(saved).toHaveLength(0);
  });

  it('auto-promotes oldest remaining method when deleted method was primary', async () => {
    const primary = makeMethod({ id: 'pm_primary', is_primary: true, created_at: '2026-01-01T00:00:00Z' });
    const older = makeMethod({ id: 'pm_older', is_primary: false, created_at: '2025-12-01T00:00:00Z' });
    const newer = makeMethod({ id: 'pm_newer', is_primary: false, created_at: '2026-02-01T00:00:00Z' });

    const { supabase, captured } = buildSupabase({
      userRow: { id: 'u-1', payment_methods: [primary, older, newer] },
    });
    const svc = new PaymentMethodsService(supabase);
    await svc.delete('u-1', 'pm_primary');

    const persistUpdate = captured.find((c) => c.op === 'update');
    const saved = (persistUpdate!.payload as { payment_methods: PaymentMethodV1[] }).payment_methods;
    expect(saved).toHaveLength(2);
    // Oldest remaining (pm_older, created 2025-12) should be promoted
    expect(saved.find((m) => m.id === 'pm_older')!.is_primary).toBe(true);
    expect(saved.find((m) => m.id === 'pm_newer')!.is_primary).toBe(false);
  });
});
