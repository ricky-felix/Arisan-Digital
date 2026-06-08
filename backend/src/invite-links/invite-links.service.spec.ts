import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InviteLinksService } from './invite-links.service';
import { SupabaseService } from '../supabase/supabase.service';

function buildSupabase(opts: {
  group?: Record<string, unknown> | null;
  membership?: Record<string, unknown> | null;
  invite?: Record<string, unknown> | null;
  existingMember?: Record<string, unknown> | null;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      order: () => chain(),
      maybeSingle: () => {
        if (table === 'groups') return Promise.resolve({ data: opts.group ?? null });
        if (table === 'group_members') return Promise.resolve({ data: opts.existingMember ?? opts.membership ?? null });
        if (table === 'invite_links') return Promise.resolve({ data: opts.invite ?? null });
        return Promise.resolve({ data: null });
      },
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'invite_links') return resolve({ data: [], error: null });
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
              Promise.resolve({ data: { id: 'invite-new', ...(payload as object) }, error: null }),
          }),
          then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({ data: { ...opts.invite, ...(payload as object) }, error: null }),
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

describe('InviteLinksService.create', () => {
  it('throws NotFoundException when group does not exist', async () => {
    const { supabase } = buildSupabase({ group: null });
    const svc = new InviteLinksService(supabase);
    await expect(svc.create({ group_id: 'g-missing' }, 'admin')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when requester is not admin', async () => {
    const { supabase } = buildSupabase({
      group: { admin_id: 'real-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new InviteLinksService(supabase);
    await expect(svc.create({ group_id: 'g-1' }, 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('inserts invite link when caller is the group admin_id', async () => {
    const { supabase, captured } = buildSupabase({ group: { admin_id: 'admin' } });
    const svc = new InviteLinksService(supabase);
    const result = await svc.create({ group_id: 'g-1', max_uses: 5 }, 'admin');
    expect(result.id).toBe('invite-new');
    const insert = captured.find((c) => c.op === 'insert' && c.table === 'invite_links');
    expect(insert).toBeDefined();
    expect((insert!.payload as { max_uses: number }).max_uses).toBe(5);
    expect((insert!.payload as { is_active: boolean }).is_active).toBe(true);
  });
});

describe('InviteLinksService.revoke', () => {
  it('throws NotFoundException when invite link does not exist', async () => {
    const { supabase } = buildSupabase({ invite: null });
    const svc = new InviteLinksService(supabase);
    await expect(svc.revoke('missing', 'admin')).rejects.toThrow(NotFoundException);
  });

  it('sets is_active=false when admin revokes the link', async () => {
    const { supabase, captured } = buildSupabase({
      group: { admin_id: 'admin' },
      invite: { id: 'inv-1', group_id: 'g-1', is_active: true },
    });
    const svc = new InviteLinksService(supabase);
    const result = await svc.revoke('inv-1', 'admin');
    expect(result).toMatchObject({ is_active: false });
    const update = captured.find((c) => c.op === 'update' && c.table === 'invite_links');
    expect((update!.payload as { is_active: boolean }).is_active).toBe(false);
  });
});

describe('InviteLinksService.redeem', () => {
  const validInvite = {
    id: 'inv-1',
    group_id: 'g-1',
    token: 'abc123',
    is_active: true,
    expires_at: null,
    max_uses: null,
    use_count: 0,
    groups: { id: 'g-1', name: 'Test Group', description: null, photo_url: null, status: 'active' },
  };

  it('throws NotFoundException when invite not found', async () => {
    const { supabase } = buildSupabase({ invite: null });
    const svc = new InviteLinksService(supabase);
    await expect(svc.redeem('bad-token', 'user')).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when invite has been revoked', async () => {
    const { supabase } = buildSupabase({ invite: { ...validInvite, is_active: false } });
    const svc = new InviteLinksService(supabase);
    await expect(svc.redeem('abc123', 'user')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when invite has expired', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const { supabase } = buildSupabase({ invite: { ...validInvite, expires_at: past } });
    const svc = new InviteLinksService(supabase);
    await expect(svc.redeem('abc123', 'user')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when max_uses is reached', async () => {
    const { supabase } = buildSupabase({ invite: { ...validInvite, max_uses: 3, use_count: 3 } });
    const svc = new InviteLinksService(supabase);
    await expect(svc.redeem('abc123', 'user')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when user is already a member', async () => {
    const { supabase } = buildSupabase({
      invite: validInvite,
      existingMember: { id: 'gm-1' },
    });
    const svc = new InviteLinksService(supabase);
    await expect(svc.redeem('abc123', 'user')).rejects.toThrow(BadRequestException);
  });

  it('inserts group_members row and increments use_count on successful redemption', async () => {
    const { supabase, captured } = buildSupabase({
      invite: validInvite,
      existingMember: null,
    });
    const svc = new InviteLinksService(supabase);
    const result = await svc.redeem('abc123', 'new-user');
    expect(result.message).toContain('Successfully joined');
    const memberInsert = captured.find((c) => c.op === 'insert' && c.table === 'group_members');
    expect(memberInsert).toBeDefined();
    expect((memberInsert!.payload as { group_role: string }).group_role).toBe('member');
    const useCountUpdate = captured.find((c) => c.op === 'update' && c.table === 'invite_links');
    expect(useCountUpdate).toBeDefined();
    expect((useCountUpdate!.payload as { use_count: number }).use_count).toBe(1);
  });
});
