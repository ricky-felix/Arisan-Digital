import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BillSettlementsService } from './bill-settlements.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

// ─── Supabase stub factory ────────────────────────────────────────────────────

type TableConfig = Record<string, unknown>;

function buildSupabase(config: {
  participant?: TableConfig | null; // bill_participants row for the caller
  bill?: TableConfig | null;
  settlement?: TableConfig | null;
  nonPayerParticipants?: TableConfig[];
  confirmedSettlements?: TableConfig[];
}) {
  const from = jest.fn((table: string) => {
    const makeFilter = (): Record<string, unknown> => ({
      eq: () => makeFilter(),
      neq: () => makeFilter(),
      or: () => makeFilter(),
      order: () => makeFilter(),
      maybeSingle: () => {
        if (table === 'bill_participants') {
          return Promise.resolve({ data: config.participant ?? null });
        }
        if (table === 'bills') {
          return Promise.resolve({ data: config.bill ?? null });
        }
        if (table === 'bill_settlements') {
          return Promise.resolve({ data: config.settlement ?? null });
        }
        return Promise.resolve({ data: null });
      },
      single: () => {
        if (table === 'bill_settlements') {
          return Promise.resolve({ data: config.settlement, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'bill_participants') {
          return resolve({ data: config.nonPayerParticipants ?? [], error: null });
        }
        if (table === 'bill_settlements') {
          return resolve({ data: config.confirmedSettlements ?? [], error: null });
        }
        return resolve({ data: [], error: null });
      },
    });

    return {
      select: () => makeFilter(),
      insert: (payload: unknown) => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'settlement-new', ...(payload as object) },
              error: null,
            }),
        }),
      }),
      update: (payload: unknown) => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { ...config.settlement, ...(payload as object) },
                error: null,
              }),
          }),
          then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
        }),
      }),
    };
  });

  return { admin: { from } } as unknown as SupabaseService;
}

function makeNotifications(): jest.Mocked<Pick<NotificationsService, 'create' | 'createMany'>> {
  return {
    create: jest.fn().mockResolvedValue(null),
    createMany: jest.fn().mockResolvedValue(undefined),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BillSettlementsService.create', () => {
  const baseDto = {
    bill_id: 'bill-1',
    receiver_id: 'payer-id',
    amount: 50_000,
  };

  it('throws ForbiddenException when caller is not a bill participant', async () => {
    const supabase = buildSupabase({ participant: null, bill: { id: 'bill-1', paid_by: 'payer-id', status: 'open' } });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.create(baseDto, 'stranger')).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException when bill does not exist', async () => {
    const supabase = buildSupabase({ participant: { id: 'bp-1' }, bill: null });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.create(baseDto, 'member-a')).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when bill is already settled', async () => {
    const supabase = buildSupabase({
      participant: { id: 'bp-1' },
      bill: { id: 'bill-1', paid_by: 'payer-id', status: 'settled' },
    });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.create(baseDto, 'member-a')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when receiver_id is not the bill payer', async () => {
    const supabase = buildSupabase({
      participant: { id: 'bp-1' },
      bill: { id: 'bill-1', paid_by: 'actual-payer', status: 'open' },
    });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(
      svc.create({ ...baseDto, receiver_id: 'wrong-receiver' }, 'member-a'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when payer tries to settle debt to themselves', async () => {
    const supabase = buildSupabase({
      participant: { id: 'bp-1' },
      bill: { id: 'bill-1', paid_by: 'self-id', status: 'open' },
    });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(
      svc.create({ ...baseDto, receiver_id: 'self-id' }, 'self-id'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns the created settlement row when inputs are valid', async () => {
    const supabase = buildSupabase({
      participant: { id: 'bp-1' },
      bill: { id: 'bill-1', paid_by: 'payer-id', status: 'open' },
    });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    const result = await svc.create(baseDto, 'member-a');
    expect(result).toMatchObject({ id: 'settlement-new', status: 'pending' });
  });
});

describe('BillSettlementsService.confirm', () => {
  const pendingSettlement = {
    id: 'sett-1',
    bill_id: 'bill-1',
    payer_id: 'member-a',
    receiver_id: 'payer-id',
    amount: 50_000,
    status: 'pending',
  };

  it('throws NotFoundException when settlement does not exist', async () => {
    const supabase = buildSupabase({ settlement: null });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.confirm('missing', 'payer-id')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when caller is not the receiver', async () => {
    const supabase = buildSupabase({
      settlement: pendingSettlement,
      bill: { id: 'bill-1', paid_by: 'payer-id', status: 'open' },
      nonPayerParticipants: [],
      confirmedSettlements: [],
    });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.confirm('sett-1', 'not-receiver')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when settlement is already confirmed', async () => {
    const alreadyConfirmed = { ...pendingSettlement, status: 'confirmed' };
    const supabase = buildSupabase({ settlement: alreadyConfirmed });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.confirm('sett-1', 'payer-id')).rejects.toThrow(BadRequestException);
  });

  it('resolves successfully for the legitimate receiver on a pending settlement', async () => {
    const supabase = buildSupabase({
      settlement: pendingSettlement,
      bill: { id: 'bill-1', paid_by: 'payer-id', status: 'open' },
      nonPayerParticipants: [{ user_id: 'member-a' }],
      confirmedSettlements: [{ payer_id: 'member-a' }],
    });
    const notif = makeNotifications();
    const svc = new BillSettlementsService(supabase, notif as unknown as NotificationsService);
    const result = await svc.confirm('sett-1', 'payer-id');
    expect(result).toMatchObject({ status: 'confirmed' });
    expect(notif.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settlement_confirmed' }),
    );
  });
});

describe('BillSettlementsService.reject', () => {
  const pendingSettlement = {
    id: 'sett-2',
    bill_id: 'bill-1',
    payer_id: 'member-b',
    receiver_id: 'payer-id',
    amount: 25_000,
    status: 'pending',
  };

  it('throws ForbiddenException when caller is not the receiver', async () => {
    const supabase = buildSupabase({ settlement: pendingSettlement });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.reject('sett-2', { reason: 'bad proof' }, 'wrong-user')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when settlement is not pending', async () => {
    const supabase = buildSupabase({ settlement: { ...pendingSettlement, status: 'rejected' } });
    const svc = new BillSettlementsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(svc.reject('sett-2', { reason: 'again' }, 'payer-id')).rejects.toThrow(BadRequestException);
  });

  it('sets status to rejected and notifies the payer', async () => {
    const supabase = buildSupabase({ settlement: pendingSettlement });
    const notif = makeNotifications();
    const svc = new BillSettlementsService(supabase, notif as unknown as NotificationsService);
    const result = await svc.reject('sett-2', { reason: 'bad image' }, 'payer-id');
    expect(result).toMatchObject({ status: 'rejected' });
    expect(notif.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settlement_rejected' }),
    );
  });
});
