import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PlansService } from './plans.service';
import { SupabaseService } from '../supabase/supabase.service';

function buildSupabase(opts: {
  plan?: Record<string, unknown> | null;
  plansList?: Array<Record<string, unknown>>;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((_table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      order: () => chain(),
      maybeSingle: () => Promise.resolve({ data: opts.plan ?? null, error: null }),
      single: () => Promise.resolve({ data: opts.plan ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        resolve({ data: opts.plansList ?? [], error: null }),
    });

    return {
      select: () => chain(),
      insert: (payload: unknown) => {
        captured.push({ table: 'plans', op: 'insert', payload });
        return {
          select: () => ({
            single: () => Promise.resolve({ data: { id: 'plan-new', ...(payload as object) }, error: null }),
          }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table: 'plans', op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({ data: { ...opts.plan, ...(payload as object) }, error: null }),
            }),
          }),
        };
      },
    };
  });

  return { captured, supabase: { admin: { from } } as unknown as SupabaseService };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PlansService.listActive', () => {
  it('returns only active plans', async () => {
    const plans = [
      { id: 'p-1', slug: 'free', is_active: true, price_monthly: 0 },
      { id: 'p-2', slug: 'pro', is_active: true, price_monthly: 99_000 },
    ];
    const { supabase } = buildSupabase({ plansList: plans });
    const svc = new PlansService(supabase);
    const result = await svc.listActive();
    expect(result).toHaveLength(2);
  });
});

describe('PlansService.getBySlug', () => {
  it('throws NotFoundException when plan does not exist', async () => {
    const { supabase } = buildSupabase({ plan: null });
    const svc = new PlansService(supabase);
    await expect(svc.getBySlug('unknown')).rejects.toThrow(NotFoundException);
  });

  it('returns the plan when found', async () => {
    const { supabase } = buildSupabase({ plan: { id: 'p-1', slug: 'pro', is_active: true } });
    const svc = new PlansService(supabase);
    const result = await svc.getBySlug('pro');
    expect(result.slug).toBe('pro');
  });
});

describe('PlansService.create', () => {
  it('throws BadRequestException when slug is missing', async () => {
    const { supabase } = buildSupabase({});
    const svc = new PlansService(supabase);
    await expect(svc.create({ name: 'Pro' } as Parameters<typeof svc.create>[0])).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when name is missing', async () => {
    const { supabase } = buildSupabase({});
    const svc = new PlansService(supabase);
    await expect(svc.create({ slug: 'pro' } as Parameters<typeof svc.create>[0])).rejects.toThrow(BadRequestException);
  });

  it('inserts a new plan and returns it', async () => {
    const { supabase, captured } = buildSupabase({});
    const svc = new PlansService(supabase);
    const result = await svc.create({
      slug: 'business',
      name: 'Business Plan',
      price_monthly: 199_000,
      price_yearly: 1_990_000,
    });
    expect(result.id).toBe('plan-new');
    const insert = captured.find((c) => c.op === 'insert');
    expect((insert!.payload as { slug: string }).slug).toBe('business');
  });
});

describe('PlansService.deactivate', () => {
  it('throws NotFoundException when plan does not exist', async () => {
    const { supabase } = buildSupabase({ plan: null });
    const svc = new PlansService(supabase);
    await expect(svc.deactivate('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('sets is_active=false without hard-deleting', async () => {
    const { supabase, captured } = buildSupabase({
      plan: { id: 'p-1', slug: 'pro', is_active: true },
    });
    const svc = new PlansService(supabase);
    const result = await svc.deactivate('pro');
    expect(result).toMatchObject({ is_active: false });
    const update = captured.find((c) => c.op === 'update');
    expect((update!.payload as { is_active: boolean }).is_active).toBe(false);
  });
});
