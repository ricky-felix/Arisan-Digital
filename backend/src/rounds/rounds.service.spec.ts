import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { SupabaseService } from '../supabase/supabase.service';

function buildSupabase(opts: {
  round?: Record<string, unknown> | null;
  group?: Record<string, unknown> | null;
  membership?: Record<string, unknown> | null;
  remainingRounds?: Array<{ id: string }>;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      neq: () => chain(),
      maybeSingle: () => {
        if (table === 'rounds') return Promise.resolve({ data: opts.round ?? null, error: null });
        if (table === 'groups') return Promise.resolve({ data: opts.group ?? null });
        if (table === 'group_members') return Promise.resolve({ data: opts.membership ?? null });
        return Promise.resolve({ data: null });
      },
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'rounds') return resolve({ data: opts.remainingRounds ?? [], error: null });
        return resolve({ data: [], error: null });
      },
      order: () => chain(),
    });

    return {
      select: () => chain(),
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { ...opts.round, ...(payload as object) },
                  error: null,
                }),
            }),
            eq: () => ({
              then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
            }),
            then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
          }),
        };
      },
    };
  });

  return { captured, supabase: { admin: { from } } as unknown as SupabaseService };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RoundsService.findOne', () => {
  it('throws NotFoundException when round does not exist', async () => {
    const { supabase } = buildSupabase({ round: null });
    const svc = new RoundsService(supabase);
    await expect(svc.findOne('r-missing')).rejects.toThrow(NotFoundException);
  });

  it('returns the round when found', async () => {
    const { supabase } = buildSupabase({ round: { id: 'r-1', status: 'upcoming', group_id: 'g-1' } });
    const svc = new RoundsService(supabase);
    const result = await svc.findOne('r-1');
    expect(result.id).toBe('r-1');
  });
});

describe('RoundsService.activate', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      round: { id: 'r-1', status: 'upcoming', group_id: 'g-1' },
      group: { admin_id: 'real-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new RoundsService(supabase);
    await expect(svc.activate('r-1', 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when round status is not upcoming', async () => {
    const { supabase } = buildSupabase({
      round: { id: 'r-1', status: 'active', group_id: 'g-1' },
      group: { admin_id: 'admin' },
    });
    const svc = new RoundsService(supabase);
    await expect(svc.activate('r-1', 'admin')).rejects.toThrow(BadRequestException);
  });

  it('sets status to active when all checks pass', async () => {
    const { supabase, captured } = buildSupabase({
      round: { id: 'r-1', status: 'upcoming', group_id: 'g-1' },
      group: { admin_id: 'admin' },
    });
    const svc = new RoundsService(supabase);
    const result = await svc.activate('r-1', 'admin');
    expect(result).toMatchObject({ status: 'active' });
    const update = captured.find((c) => c.op === 'update' && c.table === 'rounds');
    expect((update!.payload as { status: string }).status).toBe('active');
  });
});

describe('RoundsService.complete', () => {
  it('throws BadRequestException when round is not active', async () => {
    const { supabase } = buildSupabase({
      round: { id: 'r-1', status: 'upcoming', group_id: 'g-1' },
      group: { admin_id: 'admin' },
    });
    const svc = new RoundsService(supabase);
    await expect(svc.complete('r-1', 'admin')).rejects.toThrow(BadRequestException);
  });

  it('sets round status to completed', async () => {
    const { supabase, captured } = buildSupabase({
      round: { id: 'r-1', status: 'active', group_id: 'g-1' },
      group: { admin_id: 'admin' },
      remainingRounds: [{ id: 'r-2' }], // still more rounds — group not auto-completed
    });
    const svc = new RoundsService(supabase);
    const result = await svc.complete('r-1', 'admin');
    expect(result).toMatchObject({ status: 'completed' });
    const roundUpdate = captured.find((c) => c.op === 'update' && c.table === 'rounds');
    expect((roundUpdate!.payload as { status: string }).status).toBe('completed');
  });

  it('auto-completes the group when no remaining rounds exist', async () => {
    const { supabase, captured } = buildSupabase({
      round: { id: 'r-last', status: 'active', group_id: 'g-1' },
      group: { admin_id: 'admin' },
      remainingRounds: [], // no remaining rounds
    });
    const svc = new RoundsService(supabase);
    await svc.complete('r-last', 'admin');
    const groupUpdate = captured.find((c) => c.op === 'update' && c.table === 'groups');
    expect(groupUpdate).toBeDefined();
    expect((groupUpdate!.payload as { status: string }).status).toBe('completed');
  });
});

describe('RoundsService.setRecipient', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      round: { id: 'r-1', group_id: 'g-1', status: 'upcoming' },
      group: { admin_id: 'actual-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new RoundsService(supabase);
    await expect(svc.setRecipient('r-1', 'user-x', 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('updates recipient_id when caller is the group admin', async () => {
    const { supabase, captured } = buildSupabase({
      round: { id: 'r-1', group_id: 'g-1', status: 'upcoming' },
      group: { admin_id: 'admin' },
    });
    const svc = new RoundsService(supabase);
    await svc.setRecipient('r-1', 'user-x', 'admin');
    const update = captured.find((c) => c.op === 'update' && c.table === 'rounds');
    expect((update!.payload as { recipient_id: string }).recipient_id).toBe('user-x');
  });
});
