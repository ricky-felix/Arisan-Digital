import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { SupabaseService } from '../supabase/supabase.service';

// Mock bcrypt so tests don't run real hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pin'),
  compare: jest.fn(),
}));

function buildSupabase(opts: {
  userRow?: Record<string, unknown> | null;
  bankRow?: Record<string, unknown> | null;
} = {}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      maybeSingle: () => {
        if (table === 'bank_accounts') return Promise.resolve({ data: opts.bankRow ?? null, error: null });
        return Promise.resolve({ data: null });
      },
      single: () => {
        if (table === 'users') {
          if (opts.userRow === null) {
            return Promise.resolve({ data: null, error: { message: 'not found' } });
          }
          return Promise.resolve({ data: opts.userRow ?? { id: 'user-1', name: 'Alice', pin_hash: null, app_lock_enabled: false }, error: null });
        }
        if (table === 'bank_accounts') {
          return Promise.resolve({ data: opts.bankRow ?? { id: 'ba-1', bank: 'BCA' }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      order: () => chain(),
      then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
    });

    return {
      select: () => chain(),
      update: (payload: unknown) => {
        captured.push({ table, op: 'update', payload });
        return {
          eq: () => ({
            then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { ...opts.userRow, ...(payload as object) },
                  error: null,
                }),
            }),
          }),
        };
      },
      upsert: (payload: unknown) => {
        captured.push({ table, op: 'upsert', payload });
        const returnData = table === 'bank_accounts'
          ? { id: 'ba-1', ...(payload as object) }
          : { id: 'user-1', ...(payload as object) };
        return {
          select: () => ({
            single: () => Promise.resolve({ data: returnData, error: null }),
          }),
        };
      },
      delete: () => {
        captured.push({ table, op: 'delete' });
        return { eq: () => ({ then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }) }) };
      },
    };
  });

  return { captured, supabase: { admin: { from } } as unknown as SupabaseService };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UsersService.getProfile', () => {
  it('returns the user row when found', async () => {
    const { supabase } = buildSupabase({ userRow: { id: 'user-1', name: 'Alice' } });
    const svc = new UsersService(supabase);
    const result = await svc.getProfile('user-1');
    expect(result.id).toBe('user-1');
  });

  it('throws NotFoundException when user does not exist', async () => {
    const { supabase } = buildSupabase({ userRow: null });
    const svc = new UsersService(supabase);
    await expect(svc.getProfile('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('UsersService.setPin', () => {
  it('hashes the PIN and writes pin_hash to the database', async () => {
    const { supabase, captured } = buildSupabase();
    const svc = new UsersService(supabase);
    const result = await svc.setPin('user-1', { pin: '1234' });
    expect(result).toEqual({ success: true });
    expect(bcrypt.hash).toHaveBeenCalledWith('1234', 12);
    const update = captured.find((c) => c.op === 'update' && c.table === 'users');
    expect(update).toBeDefined();
    expect((update!.payload as { pin_hash: string }).pin_hash).toBe('hashed-pin');
  });
});

describe('UsersService.verifyPin', () => {
  it('returns { valid: false } when no pin_hash is set', async () => {
    const { supabase } = buildSupabase({ userRow: { id: 'user-1', pin_hash: null } });
    const svc = new UsersService(supabase);
    const result = await svc.verifyPin('user-1', { pin: '1234' });
    expect(result).toEqual({ valid: false });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('calls bcrypt.compare and returns its result', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    const { supabase } = buildSupabase({ userRow: { id: 'user-1', pin_hash: 'stored-hash' } });
    const svc = new UsersService(supabase);
    const result = await svc.verifyPin('user-1', { pin: '1234' });
    expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'stored-hash');
    expect(result).toEqual({ valid: true });
  });

  it('returns { valid: false } when PIN does not match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    const { supabase } = buildSupabase({ userRow: { id: 'user-1', pin_hash: 'stored-hash' } });
    const svc = new UsersService(supabase);
    const result = await svc.verifyPin('user-1', { pin: 'wrong' });
    expect(result).toEqual({ valid: false });
  });
});

describe('UsersService.getSecurity', () => {
  it('returns has_pin=false when pin_hash is null', async () => {
    const { supabase } = buildSupabase({ userRow: { id: 'user-1', pin_hash: null, app_lock_enabled: false } });
    const svc = new UsersService(supabase);
    const result = await svc.getSecurity('user-1');
    expect(result.has_pin).toBe(false);
    expect(result.app_lock_enabled).toBe(false);
  });

  it('returns has_pin=true when pin_hash is set', async () => {
    const { supabase } = buildSupabase({ userRow: { id: 'user-1', pin_hash: 'some-hash', app_lock_enabled: true } });
    const svc = new UsersService(supabase);
    const result = await svc.getSecurity('user-1');
    expect(result.has_pin).toBe(true);
    expect(result.app_lock_enabled).toBe(true);
  });
});

describe('UsersService.upsertBankAccount', () => {
  it('upserts a bank account and returns the saved row', async () => {
    const { supabase, captured } = buildSupabase({
      bankRow: { id: 'ba-1', bank: 'BCA', account_number: '123', holder_name: 'Alice' },
    });
    const svc = new UsersService(supabase);
    const result = await svc.upsertBankAccount('user-1', {
      bank: 'BCA',
      account_number: '123',
      holder_name: 'Alice',
    });
    expect(result).toMatchObject({ id: 'ba-1', bank: 'BCA' });
    const upsert = captured.find((c) => c.op === 'upsert' && c.table === 'bank_accounts');
    expect(upsert).toBeDefined();
    expect((upsert!.payload as { user_id: string }).user_id).toBe('user-1');
  });
});

describe('UsersService.deleteBankAccount', () => {
  it('deletes the bank account row', async () => {
    const { supabase, captured } = buildSupabase();
    const svc = new UsersService(supabase);
    const result = await svc.deleteBankAccount('user-1');
    expect(result).toEqual({ success: true });
    const del = captured.find((c) => c.op === 'delete' && c.table === 'bank_accounts');
    expect(del).toBeDefined();
  });
});
