import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseService } from '../supabase/supabase.service';

function buildSupabase(opts: {
  notification?: Record<string, unknown> | null;
  notificationsList?: Array<Record<string, unknown>>;
  unreadCount?: number;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      gte: () => chain(),
      lte: () => chain(),
      in: () => chain(),
      neq: () => chain(),
      contains: () => chain(),
      order: () => chain(),
      range: () => chain(),
      maybeSingle: () => Promise.resolve({ data: opts.notification ?? null }),
      single: () => Promise.resolve({ data: opts.notification ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) => {
        if (opts.notificationsList) return resolve({ data: opts.notificationsList, error: null });
        return resolve({ data: [], error: null });
      },
    });

    return {
      select: (cols?: string, selectOpts?: { count?: string; head?: boolean }) => {
        if (selectOpts?.head) {
          // unreadCount path
          return {
            eq: () => ({
              eq: () => ({
                then: (resolve: (v: unknown) => unknown) =>
                  resolve({ count: opts.unreadCount ?? 0, error: null }),
              }),
            }),
          };
        }
        return chain();
      },
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { id: 'notif-new', ...(payload as object) },
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
              select: () => ({
                single: () => Promise.resolve({ data: { ...opts.notification, ...(payload as object) }, error: null }),
              }),
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

describe('NotificationsService.create', () => {
  it('inserts and returns the notification', async () => {
    const { supabase } = buildSupabase({});
    const svc = new NotificationsService(supabase);
    const result = await svc.create({
      user_id: 'u-1',
      type: 'bill_created',
      title: 'New bill',
      body: 'You were added',
    });
    expect(result).toMatchObject({ id: 'notif-new' });
  });

  it('returns null (does not throw) when insert fails', async () => {
    // Build a stub that returns an error on insert
    const from = jest.fn(() => ({
      select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'db error' } }),
        }),
      }),
    }));
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const svc = new NotificationsService(supabase);
    const result = await svc.create({
      user_id: 'u-1',
      type: 'bill_created',
      title: 'T',
      body: 'B',
    });
    expect(result).toBeNull();
  });
});

describe('NotificationsService.createMany', () => {
  it('fires one notification per input without throwing', async () => {
    const { supabase, captured } = buildSupabase({});
    const svc = new NotificationsService(supabase);
    await svc.createMany([
      { user_id: 'u-1', type: 'bill_created', title: 'T1', body: 'B1' },
      { user_id: 'u-2', type: 'bill_created', title: 'T2', body: 'B2' },
    ]);
    const inserts = captured.filter((c) => c.op === 'insert');
    expect(inserts).toHaveLength(2);
  });
});

describe('NotificationsService.markRead', () => {
  it('throws NotFoundException when notification does not exist', async () => {
    const { supabase } = buildSupabase({ notification: null });
    const svc = new NotificationsService(supabase);
    await expect(svc.markRead('notif-missing', 'u-1')).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when notification belongs to another user', async () => {
    const { supabase } = buildSupabase({ notification: { id: 'n-1', user_id: 'other-user' } });
    const svc = new NotificationsService(supabase);
    await expect(svc.markRead('n-1', 'u-1')).rejects.toThrow(NotFoundException);
  });

  it('sets is_read=true for the owning user', async () => {
    const { supabase, captured } = buildSupabase({
      notification: { id: 'n-1', user_id: 'u-1', is_read: false },
    });
    const svc = new NotificationsService(supabase);
    const result = await svc.markRead('n-1', 'u-1');
    expect(result).toMatchObject({ is_read: true });
    const update = captured.find((c) => c.op === 'update');
    expect((update!.payload as { is_read: boolean }).is_read).toBe(true);
  });
});

describe('NotificationsService.unreadCount', () => {
  it('returns the count of unread notifications', async () => {
    const { supabase } = buildSupabase({ unreadCount: 7 });
    const svc = new NotificationsService(supabase);
    const result = await svc.unreadCount('u-1');
    expect(result).toEqual({ count: 7 });
  });

  it('returns 0 when no unread notifications exist', async () => {
    const { supabase } = buildSupabase({ unreadCount: 0 });
    const svc = new NotificationsService(supabase);
    const result = await svc.unreadCount('u-1');
    expect(result).toEqual({ count: 0 });
  });
});
