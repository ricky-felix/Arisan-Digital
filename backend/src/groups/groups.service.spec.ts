import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { CreateGroupDto } from './dto/create-group.dto';

// Captures every .insert() payload by table so tests can assert what was written.
function buildSupabase(opts: {
  adminIdLookup?: string | null; // value returned for groups.select(admin_id)
  membershipRole?: string | null;
} = {}) {
  const inserts: Record<string, unknown[]> = {};

  const from = jest.fn((table: string) => ({
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: () => {
            // assertGroupAdmin path
            if (table === 'group_members') {
              return Promise.resolve({
                data: opts.membershipRole
                  ? { group_role: opts.membershipRole }
                  : null,
              });
            }
            return Promise.resolve({ data: null });
          },
        }),
        maybeSingle: () => {
          if (table === 'groups') {
            return Promise.resolve({
              data:
                opts.adminIdLookup !== undefined
                  ? { admin_id: opts.adminIdLookup }
                  : null,
            });
          }
          return Promise.resolve({ data: null });
        },
      }),
    }),
    insert: (payload: unknown) => {
      inserts[table] = (inserts[table] ?? []).concat(
        Array.isArray(payload) ? payload : [payload],
      );
      return {
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: `${table}-row`, ...(payload as object) },
              error: null,
            }),
        }),
        then: (resolve: (v: unknown) => unknown) =>
          resolve({ data: null, error: null }),
      };
    },
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({ data: { id: 'updated' }, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: () => ({
        then: (resolve: (v: unknown) => unknown) =>
          resolve({ data: null, error: null }),
      }),
    }),
  }));

  return {
    inserts,
    supabase: { admin: { from } } as unknown as SupabaseService,
  };
}

describe('GroupsService.create', () => {
  const baseDto = (overrides: Partial<CreateGroupDto> = {}): CreateGroupDto =>
    ({
      name: 'Test Arisan',
      amount_per_round: 100_000,
      frequency: 'weekly',
      giliran_method: 'random',
      start_date: '2026-01-01',
      total_rounds: 4,
      ...overrides,
    }) as CreateGroupDto;

  it('inserts creator as group_role=admin', async () => {
    const stub = buildSupabase();
    const service = new GroupsService(stub.supabase);

    await service.create(baseDto({ giliran_method: 'manual' }), 'user-1');

    const memberInserts = stub.inserts['group_members'];
    expect(memberInserts).toHaveLength(1);
    expect(memberInserts[0]).toMatchObject({ user_id: 'user-1', group_role: 'admin' });
  });

  it('scaffolds rounds when giliran_method is random (weekly)', async () => {
    const stub = buildSupabase();
    const service = new GroupsService(stub.supabase);

    await service.create(baseDto({ total_rounds: 3 }), 'user-1');

    const rounds = stub.inserts['rounds'] as Array<{
      round_number: number;
      scheduled_date: string;
      status: string;
    }>;
    expect(rounds).toHaveLength(3);
    expect(rounds.map((r) => r.round_number)).toEqual([1, 2, 3]);
    expect(rounds[0].scheduled_date).toBe('2026-01-01');
    expect(rounds[1].scheduled_date).toBe('2026-01-08');
    expect(rounds[2].scheduled_date).toBe('2026-01-15');
    expect(rounds.every((r) => r.status === 'upcoming')).toBe(true);
  });

  it('scaffolds rounds with monthly cadence', async () => {
    const stub = buildSupabase();
    const service = new GroupsService(stub.supabase);

    await service.create(
      baseDto({ total_rounds: 3, frequency: 'monthly', start_date: '2026-01-15' }),
      'user-1',
    );

    const rounds = stub.inserts['rounds'] as Array<{ scheduled_date: string }>;
    expect(rounds.map((r) => r.scheduled_date)).toEqual([
      '2026-01-15',
      '2026-02-15',
      '2026-03-15',
    ]);
  });

  it('does NOT scaffold rounds when giliran_method is manual', async () => {
    const stub = buildSupabase();
    const service = new GroupsService(stub.supabase);

    await service.create(baseDto({ giliran_method: 'manual' }), 'user-1');

    expect(stub.inserts['rounds']).toBeUndefined();
  });
});

describe('GroupsService.assertGroupAdmin', () => {
  it('passes when caller is the groups.admin_id', async () => {
    const stub = buildSupabase({ adminIdLookup: 'user-1' });
    const service = new GroupsService(stub.supabase);
    await expect(service.assertGroupAdmin('g-1', 'user-1')).resolves.toBeUndefined();
  });

  it('passes when caller has group_role=admin in group_members', async () => {
    const stub = buildSupabase({
      adminIdLookup: 'someone-else',
      membershipRole: 'admin',
    });
    const service = new GroupsService(stub.supabase);
    await expect(service.assertGroupAdmin('g-1', 'user-1')).resolves.toBeUndefined();
  });

  it('rejects when caller is not admin', async () => {
    const stub = buildSupabase({
      adminIdLookup: 'someone-else',
      membershipRole: 'member',
    });
    const service = new GroupsService(stub.supabase);
    await expect(service.assertGroupAdmin('g-1', 'user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws NotFoundException when group does not exist', async () => {
    // Override: groups.maybeSingle returns null (no row)
    const from = jest.fn(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null }),
        }),
      }),
    }));
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const service = new GroupsService(supabase);
    await expect(service.assertGroupAdmin('g-missing', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
