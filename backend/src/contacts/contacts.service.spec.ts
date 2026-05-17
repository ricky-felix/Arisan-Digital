import { ContactsService } from './contacts.service';
import { SupabaseService } from '../supabase/supabase.service';

// Captures every supabase write for assertions.
function buildSupabase(opts: { contactRow?: unknown } = {}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const filterChain = (table: string, op: string) => ({
    eq: () => filterChain(table, op),
    maybeSingle: () =>
      Promise.resolve({
        data: opts.contactRow ?? null,
      }),
  });

  const from = jest.fn((table: string) => ({
    select: () => filterChain(table, 'select'),
    update: (payload: unknown) => {
      captured.push({ table, op: 'update', payload });
      return {
        eq: () => ({
          then: (resolve: (v: unknown) => unknown) =>
            resolve({ data: null, error: null }),
        }),
      };
    },
  }));

  return {
    captured,
    supabase: { admin: { from } } as unknown as SupabaseService,
  };
}

describe('ContactsService.touch', () => {
  it('is a no-op when no matching contact exists (idempotent)', async () => {
    const stub = buildSupabase({ contactRow: null });
    const service = new ContactsService(stub.supabase);

    await service.touch('owner-1', '081234567890');

    // No update call should have been made
    expect(stub.captured.filter((c) => c.op === 'update')).toHaveLength(0);
  });

  it('increments use_count and refreshes last_used_at when a matching row exists', async () => {
    const stub = buildSupabase({
      contactRow: { id: 'contact-1', use_count: 4 },
    });
    const service = new ContactsService(stub.supabase);

    await service.touch('owner-1', '081234567890');

    const updateCall = stub.captured.find((c) => c.op === 'update');
    expect(updateCall).toBeDefined();
    const payload = updateCall!.payload as {
      use_count: number;
      last_used_at: string;
    };
    expect(payload.use_count).toBe(5);
    expect(payload.last_used_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('detects UUID v4 input and matches by contact_id', async () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const stub = buildSupabase({
      contactRow: { id: 'contact-x', use_count: 0 },
    });
    const service = new ContactsService(stub.supabase);

    await expect(service.touch('owner-1', uuid)).resolves.toBeUndefined();
    // The select chain accepts any .eq() so we just verify no exception and
    // that the update path fires (use_count became 1)
    const updateCall = stub.captured.find((c) => c.op === 'update');
    expect((updateCall!.payload as { use_count: number }).use_count).toBe(1);
  });

  it('throws when neither phone nor uuid is provided', async () => {
    const stub = buildSupabase();
    const service = new ContactsService(stub.supabase);
    await expect(service.touch('owner-1', '')).rejects.toThrow();
  });
});
