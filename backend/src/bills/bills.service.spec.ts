import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BillsService } from './bills.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateBillDto } from './dto/create-bill.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

type Captured = { table: string; op: string; payload?: unknown };

function buildSupabase(opts: {
  billRow?: Record<string, unknown> | null;
  participantRows?: Array<{ user_id: string; id?: string }>;
  settlementCount?: number;
} = {}) {
  const captured: Captured[] = [];

  const billData = opts.billRow !== undefined
    ? opts.billRow
    : {
        id: 'bill-1',
        paid_by: 'user-payer',
        total_amount: 90_000,
        split_method: 'equal',
        status: 'open',
        title: 'Dinner',
        bill_participants: opts.participantRows ?? [{ user_id: 'user-payer', id: 'bp-1' }],
        bill_splits: [],
      };

  const from = jest.fn((table: string) => {
    return {
      select: (cols?: string) => ({
        // bills — single lookups
        eq: (col: string, val: string) => ({
          single: () => {
            if (table === 'bills') {
              if (billData === null) return Promise.resolve({ data: null, error: new Error('not found') });
              return Promise.resolve({ data: billData, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
          // for listMine payer query
          then: (resolve: (v: unknown) => unknown) => {
            if (table === 'bills') return resolve({ data: [billData], error: null });
            if (table === 'bill_participants') return resolve({ data: [{ bill_id: 'bill-1' }], error: null });
            return resolve({ data: [], error: null });
          },
          in: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
          }),
          // settlements count check
          head: (opts2?: { count?: string; head?: boolean }) => ({
            eq: () => ({
              then: (resolve: (v: unknown) => unknown) =>
                resolve({ count: opts.settlementCount ?? 0, error: null }),
            }),
          }),
        }),
      }),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        const returnedData =
          table === 'bills'
            ? { id: 'bill-1', paid_by: 'user-payer', total_amount: 90_000, split_method: 'equal', title: 'Dinner' }
            : table === 'bill_participants'
            ? [{ id: 'bp-1', user_id: 'user-payer' }, { id: 'bp-2', user_id: 'user-B' }]
            : null;
        return {
          select: () => ({
            single: () => Promise.resolve({ data: returnedData, error: null }),
            then: (resolve: (v: unknown) => unknown) =>
              resolve({ data: returnedData ?? payload, error: null }),
          }),
          then: (resolve: (v: unknown) => unknown) => resolve({ data: returnedData, error: null }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { ...billData, ...(payload as object) }, error: null }),
            }),
            then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
          }),
        };
      },
      delete: () => {
        captured.push({ table, op: 'delete' });
        return {
          eq: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
          }),
        };
      },
    };
  });

  return {
    captured,
    supabase: { admin: { from } } as unknown as SupabaseService,
  };
}

function makeNotifications(): jest.Mocked<Pick<NotificationsService, 'create' | 'createMany'>> {
  return {
    create: jest.fn().mockResolvedValue(null),
    createMany: jest.fn().mockResolvedValue(undefined),
  };
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('BillsService.findOne', () => {
  const makeBill = (paid_by: string, participants: Array<{ user_id: string }>) => ({
    id: 'bill-1',
    paid_by,
    total_amount: 60_000,
    split_method: 'equal',
    status: 'open',
    title: 'Lunch',
    bill_participants: participants,
    bill_splits: [],
  });

  it('returns bill when caller is the payer', async () => {
    const bill = makeBill('user-1', [{ user_id: 'user-1' }]);
    const { supabase } = buildSupabase({ billRow: bill });
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    const result = await service.findOne('bill-1', 'user-1');
    expect(result.id).toBe('bill-1');
  });

  it('returns bill when caller is a participant (not payer)', async () => {
    const bill = makeBill('user-payer', [{ user_id: 'user-payer' }, { user_id: 'user-participant' }]);
    const { supabase } = buildSupabase({ billRow: bill });
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    const result = await service.findOne('bill-1', 'user-participant');
    expect(result.id).toBe('bill-1');
  });

  it('throws NotFoundException when bill not found', async () => {
    const { supabase } = buildSupabase({ billRow: null });
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when caller is neither payer nor participant', async () => {
    const bill = makeBill('user-payer', [{ user_id: 'user-payer' }]);
    const { supabase } = buildSupabase({ billRow: bill });
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(service.findOne('bill-1', 'stranger')).rejects.toThrow(ForbiddenException);
  });
});

describe('BillsService.markSettled', () => {
  function buildForSettle(status: string) {
    const bill = {
      id: 'bill-1',
      paid_by: 'user-1',
      total_amount: 100_000,
      split_method: 'equal',
      status,
      title: 'Settle me',
      bill_participants: [{ user_id: 'user-1' }],
      bill_splits: [],
    };
    const captured: Captured[] = [];

    const from = jest.fn((table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: bill, error: null }),
        }),
      }),
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { ...bill, ...(payload as object) }, error: null }),
            }),
          }),
        };
      },
    }));

    return {
      captured,
      supabase: { admin: { from } } as unknown as SupabaseService,
    };
  }

  it('throws ForbiddenException when caller is not the payer', async () => {
    const { supabase } = buildForSettle('open');
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(service.markSettled('bill-1', 'not-payer')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when bill is already settled', async () => {
    const { supabase } = buildForSettle('settled');
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(service.markSettled('bill-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('updates status to settled when all checks pass', async () => {
    const { supabase, captured } = buildForSettle('open');
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await service.markSettled('bill-1', 'user-1');
    const updateCall = captured.find((c) => c.op === 'update' && c.table === 'bills');
    expect(updateCall).toBeDefined();
    expect((updateCall!.payload as { status: string }).status).toBe('settled');
  });
});

describe('BillsService.delete', () => {
  function buildForDelete(settlementCount: number) {
    const bill = {
      id: 'bill-1',
      paid_by: 'user-1',
      status: 'open',
      title: 'To Delete',
      bill_participants: [{ user_id: 'user-1' }],
      bill_splits: [],
    };
    const captured: Captured[] = [];

    const from = jest.fn((table: string) => ({
      select: (cols?: string, opts2?: { count?: string; head?: boolean }) => {
        if (opts2?.head) {
          return {
            eq: () => ({
              then: (resolve: (v: unknown) => unknown) =>
                resolve({ count: settlementCount, error: null }),
            }),
          };
        }
        return {
          eq: () => ({
            single: () => Promise.resolve({ data: bill, error: null }),
          }),
        };
      },
      delete: () => {
        captured.push({ table, op: 'delete' });
        return {
          eq: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
          }),
        };
      },
    }));

    return {
      captured,
      supabase: { admin: { from } } as unknown as SupabaseService,
    };
  }

  it('throws ForbiddenException when caller is not the payer', async () => {
    const { supabase } = buildForDelete(0);
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(service.delete('bill-1', 'not-payer')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when settlement records exist', async () => {
    const { supabase } = buildForDelete(1);
    const service = new BillsService(supabase, makeNotifications() as unknown as NotificationsService);
    await expect(service.delete('bill-1', 'user-1')).rejects.toThrow(BadRequestException);
  });
});

describe('BillsService — ensurePayerInParticipants (via create path)', () => {
  it('auto-inserts payer when not present in participants list', async () => {
    const captured: Captured[] = [];

    const from = jest.fn((table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => {
            const data =
              table === 'bills'
                ? { id: 'b-1', paid_by: 'user-1', total_amount: 100_000, split_method: 'equal', title: 'T' }
                : { id: 'bp-1', user_id: 'user-1', bill_participants: [], bill_splits: [] };
            return Promise.resolve({ data, error: null });
          },
          then: (resolve: (v: unknown) => unknown) =>
            resolve({ data: table === 'bills' ? [{ id: 'b-1', paid_by: 'user-1', bill_participants: [{ user_id: 'user-1' }], bill_splits: [] }] : [{ bill_id: 'b-1' }], error: null }),
          in: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }) }),
        }),
      }),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        const rows = Array.isArray(payload) ? payload : [payload];
        const returnData = table === 'bills'
          ? { id: 'b-1', paid_by: 'user-1', total_amount: 100_000, split_method: 'equal', title: 'T' }
          : rows.map((r: unknown, i: number) => ({ ...(r as object), id: `bp-${i}` }));
        return {
          select: () => ({
            single: () => Promise.resolve({ data: returnData, error: null }),
            then: (resolve: (v: unknown) => unknown) => resolve({ data: returnData, error: null }),
          }),
          then: (resolve: (v: unknown) => unknown) => resolve({ data: returnData, error: null }),
        };
      },
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }) }),
      delete: () => ({ eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) }),
    }));

    const supabase = { admin: { from } } as unknown as SupabaseService;
    const notif = makeNotifications() as unknown as NotificationsService;
    const service = new BillsService(supabase, notif);

    const dto: CreateBillDto = {
      title: 'Test Bill',
      total_amount: 100_000,
      split_method: 'equal',
      participants: [{ user_id: 'user-B' }], // payer NOT in list
    } as CreateBillDto;

    await service.create(dto, 'user-1');

    const participantInsert = captured.find((c) => c.table === 'bill_participants' && c.op === 'insert');
    expect(participantInsert).toBeDefined();
    const rows = participantInsert!.payload as Array<{ user_id: string }>;
    const userIds = rows.map((r) => r.user_id);
    expect(userIds).toContain('user-1'); // payer auto-added
    expect(userIds).toContain('user-B');
  });
});
