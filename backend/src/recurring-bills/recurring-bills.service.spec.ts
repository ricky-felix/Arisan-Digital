import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RecurringBillsService } from './recurring-bills.service';
import { SupabaseService } from '../supabase/supabase.service';
import { BillsService } from '../bills/bills.service';
import type { CreateRecurringBillDto } from './dto/create-recurring-bill.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

type Captured = { table: string; op: string; payload?: unknown };

function buildSupabase(opts: {
  insertData?: Record<string, unknown> | null;
  insertError?: Error | null;
  findData?: Record<string, unknown> | null;
  listData?: Array<Record<string, unknown>>;
  updateError?: Error | null;
  deleteError?: Error | null;
  dueBills?: Array<Record<string, unknown>>;
} = {}) {
  const captured: Captured[] = [];

  const from = jest.fn((table: string) => {
    return {
      select: () => ({
        eq: (col: string, val: unknown) => {
          // is_active eq for materializeDue
          if (col === 'is_active') {
            return {
              lte: () => ({
                then: (resolve: (v: unknown) => unknown) =>
                  resolve({ data: opts.dueBills ?? [], error: null }),
              }),
            };
          }
          // paid_by eq for listMine and findOne
          return {
            maybeSingle: () =>
              Promise.resolve({ data: opts.findData ?? null, error: null }),
            order: () => ({
              then: (resolve: (v: unknown) => unknown) =>
                resolve({ data: opts.listData ?? [], error: null }),
            }),
          };
        },
        order: () => ({
          then: (resolve: (v: unknown) => unknown) =>
            resolve({ data: opts.listData ?? [], error: null }),
        }),
      }),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: opts.insertData ?? { id: 'rb-1', ...(payload as object) },
              error: opts.insertError ?? null,
            }),
          }),
        };
      },
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: 'rb-1', ...(payload as object) },
                error: opts.updateError ?? null,
              }),
            }),
            then: (resolve: (v: unknown) => unknown) =>
              resolve({ data: null, error: opts.updateError ?? null }),
          }),
        };
      },
      delete: () => {
        captured.push({ table, op: 'delete' });
        return {
          eq: () => ({
            then: (resolve: (v: unknown) => unknown) =>
              resolve({ data: null, error: opts.deleteError ?? null }),
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

function makeBillsService(): jest.Mocked<Pick<BillsService, 'createFromRecurring'>> {
  return { createFromRecurring: jest.fn().mockResolvedValue({ id: 'bill-1' }) };
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('RecurringBillsService.create', () => {
  it('inserts a recurring bill and returns the created row', async () => {
    const { supabase, captured } = buildSupabase({ insertData: { id: 'rb-1' } });
    const billsService = makeBillsService();
    const service = new RecurringBillsService(supabase, billsService as unknown as BillsService);

    const dto: CreateRecurringBillDto = {
      title: 'Monthly Netflix',
      total_amount: 50_000,
      split_method: 'equal',
      frequency: 'monthly',
      start_date: '2026-01-01',
      next_due_date: '2026-01-01',
      participants: [{ user_id: 'user-2' }],
    } as never;

    const result = await service.create(dto, 'user-1');

    expect(result).toEqual({ id: 'rb-1' });
    const insertCall = captured.find((c) => c.op === 'insert');
    expect(insertCall).toBeDefined();
    const payload = insertCall!.payload as Record<string, unknown>;
    expect(payload.title).toBe('Monthly Netflix');
    expect(payload.paid_by).toBe('user-1');
    expect(payload.is_active).toBe(true);
  });

  it('throws BadRequestException when insert fails', async () => {
    const { supabase } = buildSupabase({ insertError: new Error('db error') });
    const service = new RecurringBillsService(supabase, {} as BillsService);

    const dto = {
      title: 'Test',
      total_amount: 10_000,
      split_method: 'equal',
      frequency: 'weekly',
      start_date: '2026-01-01',
      next_due_date: '2026-01-01',
      participants: [],
    } as unknown as CreateRecurringBillDto;

    await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
  });
});

describe('RecurringBillsService.findOne', () => {
  it('returns the recurring bill when owner matches', async () => {
    const { supabase } = buildSupabase({ findData: { id: 'rb-1', paid_by: 'user-1' } });
    const service = new RecurringBillsService(supabase, {} as BillsService);

    const result = await service.findOne('rb-1', 'user-1');
    expect(result).toEqual({ id: 'rb-1', paid_by: 'user-1' });
  });

  it('throws NotFoundException when recurring bill not found', async () => {
    const { supabase } = buildSupabase({ findData: null });
    const service = new RecurringBillsService(supabase, {} as BillsService);

    await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when caller is not the owner', async () => {
    const { supabase } = buildSupabase({ findData: { id: 'rb-1', paid_by: 'owner-user' } });
    const service = new RecurringBillsService(supabase, {} as BillsService);

    await expect(service.findOne('rb-1', 'other-user')).rejects.toThrow(ForbiddenException);
  });
});

describe('RecurringBillsService.materializeDue', () => {
  it('returns { created: 0 } when no bills are due', async () => {
    const { supabase } = buildSupabase({ dueBills: [] });
    // Patch the select chain to support the is_active + lte filter
    const from = jest.fn().mockReturnValue({
      select: () => ({
        eq: () => ({
          lte: () => ({
            then: (resolve: (v: unknown) => unknown) =>
              resolve({ data: [], error: null }),
          }),
        }),
      }),
    });
    const patchedSupabase = { admin: { from } } as unknown as SupabaseService;
    const billsService = makeBillsService();
    const service = new RecurringBillsService(patchedSupabase, billsService as unknown as BillsService);

    const result = await service.materializeDue(new Date('2026-06-15'));
    expect(result).toEqual({ created: 0 });
    expect(billsService.createFromRecurring).not.toHaveBeenCalled();
  });

  it('creates bills and advances next_due_date for each due recurring bill', async () => {
    const dueBill = {
      id: 'rb-1',
      title: 'Weekly Split',
      total_amount: 100_000,
      split_method: 'equal',
      frequency: 'weekly',
      next_due_date: '2026-06-10',
      start_date: '2026-01-01',
      end_date: null,
      group_id: null,
      paid_by: 'user-1',
      participants: JSON.stringify([{ user_id: 'user-2' }]),
    };

    const captured: Array<{ op: string; payload?: unknown }> = [];
    const from = jest.fn((table: string) => ({
      select: () => ({
        eq: () => ({
          lte: () => ({
            then: (resolve: (v: unknown) => unknown) =>
              resolve({ data: [dueBill], error: null }),
          }),
        }),
      }),
      update: (payload: unknown) => {
        captured.push({ op: 'update', payload });
        return { eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) };
      },
    }));
    const patchedSupabase = { admin: { from } } as unknown as SupabaseService;
    const billsService = makeBillsService();
    const service = new RecurringBillsService(patchedSupabase, billsService as unknown as BillsService);

    const result = await service.materializeDue(new Date('2026-06-15'));

    expect(result.created).toBe(1);
    expect(billsService.createFromRecurring).toHaveBeenCalledTimes(1);

    // next_due_date should have advanced by 7 days (weekly)
    const updatePayload = captured[0]?.payload as Record<string, unknown>;
    expect(updatePayload.next_due_date).toBe('2026-06-17');
    expect(updatePayload.is_active).toBe(true);
  });

  it('deactivates the recurring bill when next_due_date exceeds end_date', async () => {
    const dueBill = {
      id: 'rb-end',
      title: 'Last Bill',
      total_amount: 50_000,
      split_method: 'equal',
      frequency: 'monthly',
      next_due_date: '2026-06-01',
      end_date: '2026-06-15', // next due after advance = 2026-07-01, exceeds end
      group_id: null,
      paid_by: 'user-1',
      participants: JSON.stringify([{ user_id: 'user-2' }]),
    };

    const captured: Array<{ payload?: unknown }> = [];
    const from = jest.fn(() => ({
      select: () => ({
        eq: () => ({
          lte: () => ({
            then: (resolve: (v: unknown) => unknown) =>
              resolve({ data: [dueBill], error: null }),
          }),
        }),
      }),
      update: (payload: unknown) => {
        captured.push({ payload });
        return { eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) };
      },
    }));
    const patchedSupabase = { admin: { from } } as unknown as SupabaseService;
    const billsService = makeBillsService();
    const service = new RecurringBillsService(patchedSupabase, billsService as unknown as BillsService);

    await service.materializeDue(new Date('2026-06-15'));

    const updatePayload = captured[0]?.payload as Record<string, unknown>;
    expect(updatePayload.is_active).toBe(false);
  });
});
