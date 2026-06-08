import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BillParticipantsService } from './bill-participants.service';
import { SupabaseService } from '../supabase/supabase.service';

function buildSupabase(opts: {
  bill?: Record<string, unknown> | null;
  existingParticipant?: Record<string, unknown> | null;
  currentParticipants?: Array<{ id: string; user_id: string; shares: number; percentage: number | null }>;
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const makeFilter = (): Record<string, unknown> => ({
      eq: () => makeFilter(),
      maybeSingle: () => {
        if (table === 'bills') return Promise.resolve({ data: opts.bill ?? null });
        if (table === 'bill_participants') {
          return Promise.resolve({ data: opts.existingParticipant ?? null });
        }
        return Promise.resolve({ data: null });
      },
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'bill_participants') {
          return resolve({
            data: opts.currentParticipants ?? [
              { id: 'bp-1', user_id: 'payer', shares: 1, percentage: null },
            ],
            error: null,
          });
        }
        return resolve({ data: [], error: null });
      },
    });

    return {
      select: () => makeFilter(),
      insert: (payload: unknown) => {
        captured.push({ table, op: 'insert', payload });
        return {
          then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
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

  return {
    captured,
    supabase: { admin: { from } } as unknown as SupabaseService,
  };
}

describe('BillParticipantsService.addParticipant', () => {
  const billAsPayer = { id: 'bill-1', paid_by: 'user-payer', total_amount: 90_000, split_method: 'equal' };

  it('throws NotFoundException when bill does not exist', async () => {
    const { supabase } = buildSupabase({ bill: null });
    const svc = new BillParticipantsService(supabase);
    await expect(svc.addParticipant('bill-1', { user_id: 'user-b' }, 'user-payer')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when caller is not the payer', async () => {
    const { supabase } = buildSupabase({ bill: billAsPayer });
    const svc = new BillParticipantsService(supabase);
    await expect(svc.addParticipant('bill-1', { user_id: 'user-b' }, 'impostor')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when user is already a participant', async () => {
    const { supabase } = buildSupabase({
      bill: billAsPayer,
      existingParticipant: { id: 'bp-1' },
    });
    const svc = new BillParticipantsService(supabase);
    await expect(svc.addParticipant('bill-1', { user_id: 'user-b' }, 'user-payer')).rejects.toThrow(BadRequestException);
  });

  it('inserts the new participant when all checks pass', async () => {
    const { supabase, captured } = buildSupabase({
      bill: billAsPayer,
      existingParticipant: null,
      currentParticipants: [{ id: 'bp-1', user_id: 'user-payer', shares: 1, percentage: null }],
    });
    const svc = new BillParticipantsService(supabase);
    await svc.addParticipant('bill-1', { user_id: 'user-b', shares: 1 }, 'user-payer');
    const insertCall = captured.find((c) => c.op === 'insert' && c.table === 'bill_participants');
    expect(insertCall).toBeDefined();
    expect((insertCall!.payload as { user_id: string }).user_id).toBe('user-b');
  });
});

describe('BillParticipantsService.removeParticipant', () => {
  const billAsPayer = { id: 'bill-1', paid_by: 'user-payer', total_amount: 90_000, split_method: 'equal' };

  it('throws ForbiddenException when caller is not the payer', async () => {
    const { supabase } = buildSupabase({ bill: billAsPayer });
    const svc = new BillParticipantsService(supabase);
    await expect(svc.removeParticipant('bill-1', 'user-b', 'impostor')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when trying to remove the bill payer', async () => {
    const { supabase } = buildSupabase({ bill: billAsPayer });
    const svc = new BillParticipantsService(supabase);
    await expect(svc.removeParticipant('bill-1', 'user-payer', 'user-payer')).rejects.toThrow(BadRequestException);
  });

  it('deletes the participant when all checks pass', async () => {
    const { supabase, captured } = buildSupabase({ bill: billAsPayer });
    const svc = new BillParticipantsService(supabase);
    await svc.removeParticipant('bill-1', 'user-b', 'user-payer');
    const deleteCall = captured.find((c) => c.op === 'delete' && c.table === 'bill_participants');
    expect(deleteCall).toBeDefined();
  });
});
