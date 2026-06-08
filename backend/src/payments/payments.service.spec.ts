import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

function buildSupabase(opts: {
  payment?: Record<string, unknown> | null;
  round?: Record<string, unknown> | null;
  group?: Record<string, unknown> | null;
  membership?: Record<string, unknown> | null;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      maybeSingle: () => {
        if (table === 'payments') return Promise.resolve({ data: opts.payment ?? null, error: null });
        if (table === 'rounds') return Promise.resolve({ data: opts.round ?? null, error: null });
        if (table === 'groups') return Promise.resolve({ data: opts.group ?? null });
        if (table === 'group_members') return Promise.resolve({ data: opts.membership ?? null });
        return Promise.resolve({ data: null });
      },
      order: () => chain(),
      then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
    });

    return {
      select: () => chain(),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          select: () => ({
            single: () =>
              Promise.resolve({ data: { id: 'payment-new', ...(payload as object) }, error: null }),
          }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { ...opts.payment, ...(payload as object) },
                  error: null,
                }),
            }),
          }),
        };
      },
    };
  });

  return { captured, supabase: { admin: { from } } as unknown as SupabaseService };
}

function makeNotifications(): jest.Mocked<Pick<NotificationsService, 'create' | 'createMany'>> {
  return {
    create: jest.fn().mockResolvedValue(null),
    createMany: jest.fn().mockResolvedValue(undefined),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentsService.create', () => {
  it('throws NotFoundException when round does not exist', async () => {
    const { supabase } = buildSupabase({ round: null });
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.create({ round_id: 'r-missing', amount: 100_000 }, 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when duplicate payment submitted (23505)', async () => {
    const from = jest.fn((table: string) => {
      const chain = (): Record<string, unknown> => ({
        eq: () => chain(),
        maybeSingle: () => {
          if (table === 'rounds') return Promise.resolve({ data: { id: 'r-1', group_id: 'g-1' }, error: null });
          return Promise.resolve({ data: null });
        },
      });
      return {
        select: () => chain(),
        insert: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: '23505', message: 'duplicate key' } }),
          }),
        }),
      };
    });
    const supabase = { admin: { from } } as unknown as SupabaseService;
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.create({ round_id: 'r-1', amount: 100_000 }, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('inserts payment with status=pending on success', async () => {
    const { supabase, captured } = buildSupabase({ round: { id: 'r-1', group_id: 'g-1' } });
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    const result = await svc.create({ round_id: 'r-1', amount: 100_000 }, 'user-1');
    expect(result).toMatchObject({ status: 'pending' });
    const insert = captured.find((c) => c.op === 'insert' && c.table === 'payments');
    expect(insert).toBeDefined();
    expect((insert!.payload as { payer_id: string }).payer_id).toBe('user-1');
  });
});

describe('PaymentsService.confirm', () => {
  const pendingPayment = {
    id: 'pay-1',
    group_id: 'g-1',
    round_id: 'r-1',
    payer_id: 'payer',
    amount: 100_000,
    status: 'pending',
  };

  it('throws NotFoundException when payment does not exist', async () => {
    const { supabase } = buildSupabase({ payment: null });
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.confirm('missing', 'admin')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when requester is not group admin', async () => {
    const { supabase } = buildSupabase({
      payment: pendingPayment,
      group: { admin_id: 'real-admin' },
      membership: { group_role: 'member' },
    });
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.confirm('pay-1', 'not-admin')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when payment is not pending', async () => {
    const { supabase } = buildSupabase({
      payment: { ...pendingPayment, status: 'confirmed' },
      group: { admin_id: 'admin' },
    });
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.confirm('pay-1', 'admin')).rejects.toThrow(BadRequestException);
  });

  it('confirms payment and sends notification', async () => {
    const { supabase } = buildSupabase({ payment: pendingPayment, group: { admin_id: 'admin' } });
    const notif = makeNotifications();
    const svc = new PaymentsService(supabase, notif as unknown as NotificationsService);
    const result = await svc.confirm('pay-1', 'admin');
    expect(result).toMatchObject({ status: 'confirmed' });
    expect(notif.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment_confirmed', user_id: 'payer' }),
    );
  });
});

describe('PaymentsService.reject', () => {
  const pendingPayment = {
    id: 'pay-2',
    group_id: 'g-1',
    round_id: 'r-1',
    payer_id: 'payer',
    amount: 100_000,
    status: 'pending',
  };

  it('throws BadRequestException when payment is not pending', async () => {
    const { supabase } = buildSupabase({
      payment: { ...pendingPayment, status: 'rejected' },
      group: { admin_id: 'admin' },
    });
    const svc = new PaymentsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.reject('pay-2', { rejection_reason: 'unclear proof' }, 'admin')).rejects.toThrow(BadRequestException);
  });

  it('rejects payment and sends notification', async () => {
    const { supabase } = buildSupabase({ payment: pendingPayment, group: { admin_id: 'admin' } });
    const notif = makeNotifications();
    const svc = new PaymentsService(supabase, notif as unknown as NotificationsService);
    const result = await svc.reject('pay-2', { rejection_reason: 'bad image' }, 'admin');
    expect(result).toMatchObject({ status: 'rejected' });
    expect(notif.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment_rejected', user_id: 'payer' }),
    );
  });
});
