import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { SupabaseService } from '../supabase/supabase.service';

// ─── Stub factory ─────────────────────────────────────────────────────────────

function buildSupabase(opts: {
  group?: Record<string, unknown> | null;    // groups row (admin_id)
  membership?: Record<string, unknown> | null; // group_members row (group_role)
  members?: Array<{ user_id: string }>;       // listForGroup response
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      neq: () => chain(),
      order: () => chain(),
      maybeSingle: () => {
        if (table === 'groups') return Promise.resolve({ data: opts.group ?? null });
        if (table === 'group_members') return Promise.resolve({ data: opts.membership ?? null });
        return Promise.resolve({ data: null });
      },
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'group_members') return resolve({ data: opts.members ?? [], error: null });
        return resolve({ data: [], error: null });
      },
    });

    return {
      select: () => chain(),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          select: () => ({
            single: () =>
              Promise.resolve({ data: { id: 'member-new', ...(payload as object) }, error: null }),
          }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return { eq: () => ({ eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) }) };
      },
      delete: () => {
        captured.push({ table, op: 'delete' });
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

  return { captured, supabase: { admin: { from } } as unknown as SupabaseService };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GroupMembersService.addMember', () => {
  it('throws NotFoundException when group does not exist', async () => {
    const { supabase } = buildSupabase({ group: null });
    const svc = new GroupMembersService(supabase);
    await expect(svc.addMember('g-1', { user_id: 'user-b' }, 'admin')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      group: { admin_id: 'actual-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new GroupMembersService(supabase);
    await expect(svc.addMember('g-1', { user_id: 'user-b' }, 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when user is already a member (23505)', async () => {
    const from = jest.fn((table: string) => {
      const chain = (): Record<string, unknown> => ({
        eq: () => chain(),
        maybeSingle: () => {
          if (table === 'groups') return Promise.resolve({ data: { admin_id: 'admin' } });
          return Promise.resolve({ data: null });
        },
      });
      return {
        select: () => chain(),
        insert: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: '23505', message: 'duplicate' } }),
          }),
        }),
      };
    });
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const svc = new GroupMembersService(supabase);
    await expect(svc.addMember('g-1', { user_id: 'already' }, 'admin')).rejects.toThrow(BadRequestException);
  });

  it('inserts the new member with default role=member when role not specified', async () => {
    const { supabase, captured } = buildSupabase({ group: { admin_id: 'admin' } });
    const svc = new GroupMembersService(supabase);
    const result = await svc.addMember('g-1', { user_id: 'user-b' }, 'admin');
    expect(result).toMatchObject({ group_role: 'member' });
    const insert = captured.find((c) => c.op === 'insert');
    expect((insert!.payload as { group_role: string }).group_role).toBe('member');
  });
});

describe('GroupMembersService.removeMember', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      group: { admin_id: 'actual-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new GroupMembersService(supabase);
    await expect(svc.removeMember('g-1', 'user-b', 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when trying to remove the group creator', async () => {
    const { supabase } = buildSupabase({ group: { admin_id: 'creator' } });
    const svc = new GroupMembersService(supabase);
    await expect(svc.removeMember('g-1', 'creator', 'creator')).rejects.toThrow(ForbiddenException);
  });

  it('deletes the member row when all checks pass', async () => {
    const { supabase, captured } = buildSupabase({ group: { admin_id: 'admin' } });
    const svc = new GroupMembersService(supabase);
    const result = await svc.removeMember('g-1', 'regular-member', 'admin');
    expect(result).toMatchObject({ message: 'Member removed successfully' });
    const del = captured.find((c) => c.op === 'delete');
    expect(del).toBeDefined();
  });
});

describe('GroupMembersService.assignGiliranOrder', () => {
  it('throws NotFoundException when group does not exist', async () => {
    const { supabase } = buildSupabase({ group: null });
    const svc = new GroupMembersService(supabase);
    await expect(
      svc.assignGiliranOrder('g-missing', { assignments: [{ user_id: 'u', giliran_order: 1 }] }, 'admin'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      group: { admin_id: 'real-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new GroupMembersService(supabase);
    await expect(
      svc.assignGiliranOrder('g-1', { assignments: [{ user_id: 'u', giliran_order: 1 }] }, 'not-admin'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when duplicate giliran_order values supplied', async () => {
    const { supabase } = buildSupabase({ group: { admin_id: 'admin' } });
    const svc = new GroupMembersService(supabase);
    await expect(
      svc.assignGiliranOrder(
        'g-1',
        { assignments: [{ user_id: 'u1', giliran_order: 1 }, { user_id: 'u2', giliran_order: 1 }] },
        'admin',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('issues an update for each assignment when inputs are valid', async () => {
    const { supabase, captured } = buildSupabase({ group: { admin_id: 'admin' } });
    const svc = new GroupMembersService(supabase);
    await svc.assignGiliranOrder(
      'g-1',
      {
        assignments: [
          { user_id: 'u1', giliran_order: 1 },
          { user_id: 'u2', giliran_order: 2 },
        ],
      },
      'admin',
    );
    const updates = captured.filter((c) => c.op === 'update' && c.table === 'group_members');
    expect(updates).toHaveLength(2);
  });
});

describe('GroupMembersService.randomShuffle', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      group: { admin_id: 'admin' },
      membership: { group_role: 'member' },
    });
    const svc = new GroupMembersService(supabase);
    await expect(svc.randomShuffle('g-1', 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when group has no members', async () => {
    const from = jest.fn((table: string) => {
      const chain = (): Record<string, unknown> => ({
        eq: () => chain(),
        order: () => chain(),
        maybeSingle: () => {
          if (table === 'groups') return Promise.resolve({ data: { admin_id: 'admin' } });
          return Promise.resolve({ data: null });
        },
        then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
      });
      return {
        select: () => chain(),
        update: () => ({ eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) }),
      };
    });
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const svc = new GroupMembersService(supabase);
    await expect(svc.randomShuffle('g-1', 'admin')).rejects.toThrow(BadRequestException);
  });

  it('assigns unique giliran_order values to every member', async () => {
    const members = [
      { user_id: 'u1' },
      { user_id: 'u2' },
      { user_id: 'u3' },
    ];
    const captured: { table: string; op: string; payload?: unknown }[] = [];

    const from = jest.fn((table: string) => {
      const chain = (): Record<string, unknown> => ({
        eq: () => chain(),
        neq: () => chain(),
        order: () => chain(),
        maybeSingle: () => {
          if (table === 'groups') return Promise.resolve({ data: { admin_id: 'admin' } });
          return Promise.resolve({ data: null });
        },
        then: (resolve: (v: unknown) => unknown) => {
          if (table === 'group_members') return resolve({ data: members, error: null });
          return resolve({ data: [], error: null });
        },
      });
      return {
        select: () => chain(),
        update: (payload: unknown) => {
          captured.push({ table, op: 'update', payload });
          return { eq: () => ({ eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) }) };
        },
      };
    });

    const supabase = { admin: { from } } as unknown as SupabaseService;
    const svc = new GroupMembersService(supabase);
    await svc.randomShuffle('g-1', 'admin');

    // 1 null-clear update + 3 individual updates
    const assignUpdates = captured.filter(
      (c) => c.op === 'update' && (c.payload as { giliran_order?: number | null }).giliran_order !== null,
    );
    expect(assignUpdates).toHaveLength(3);
    const orders = assignUpdates.map((c) => (c.payload as { giliran_order: number }).giliran_order);
    expect(new Set(orders).size).toBe(3); // all unique
  });
});
