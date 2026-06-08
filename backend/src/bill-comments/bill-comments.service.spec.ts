import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BillCommentsService } from './bill-comments.service';
import { SupabaseService } from '../supabase/supabase.service';

// ─── Stub factory ─────────────────────────────────────────────────────────────

function buildSupabase(opts: {
  bill?: Record<string, unknown> | null; // bills row
  billParticipant?: Record<string, unknown> | null; // bill_participants row for auth check
  comment?: Record<string, unknown> | null; // bill_comments row
  parentComment?: Record<string, unknown> | null; // parent comment for reply tests
  commentsList?: Array<Record<string, unknown>>; // listForBill response
}) {
  const captured: { table: string; op: string; payload?: unknown }[] = [];

  const from = jest.fn((table: string) => {
    const chain = (): Record<string, unknown> => ({
      eq: () => chain(),
      neq: () => chain(),
      is: () => chain(),
      order: () => chain(),
      maybeSingle: () => {
        if (table === 'bills') return Promise.resolve({ data: opts.bill ?? null });
        if (table === 'bill_participants') return Promise.resolve({ data: opts.billParticipant ?? null });
        if (table === 'bill_comments') {
          // parent comment lookup vs single comment lookup — return parentComment for parent_id check
          return Promise.resolve({ data: opts.parentComment !== undefined ? opts.parentComment : opts.comment ?? null });
        }
        return Promise.resolve({ data: null });
      },
      single: () => {
        if (table === 'bill_comments') {
          return Promise.resolve({ data: opts.comment, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      then: (resolve: (v: unknown) => unknown) => {
        if (table === 'bill_comments') return resolve({ data: opts.commentsList ?? [], error: null });
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
              Promise.resolve({
                data: { id: 'comment-new', ...(payload as object) },
                error: null,
              }),
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
                  data: { ...opts.comment, ...(payload as object) },
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

// ─── Tests ────────────────────────────────────────────────────────────────────

const ACCESS_OPTS = {
  bill: { paid_by: 'payer' },
  billParticipant: null,
};

describe('BillCommentsService.create', () => {
  it('throws NotFoundException when bill does not exist', async () => {
    const { supabase } = buildSupabase({ bill: null });
    const svc = new BillCommentsService(supabase);
    await expect(svc.create({ bill_id: 'b-1', body: 'Hi' }, 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when caller has no access to the bill', async () => {
    const { supabase } = buildSupabase({ bill: { paid_by: 'other' }, billParticipant: null });
    const svc = new BillCommentsService(supabase);
    await expect(svc.create({ bill_id: 'b-1', body: 'Hi' }, 'stranger')).rejects.toThrow(ForbiddenException);
  });

  it('creates a top-level comment when all checks pass (payer)', async () => {
    const { supabase, captured } = buildSupabase({ ...ACCESS_OPTS });
    const svc = new BillCommentsService(supabase);
    const result = await svc.create({ bill_id: 'b-1', body: 'Hello' }, 'payer');
    expect(result.id).toBe('comment-new');
    const insert = captured.find((c) => c.op === 'insert' && c.table === 'bill_comments');
    expect(insert).toBeDefined();
    expect((insert!.payload as { body: string }).body).toBe('Hello');
  });

  it('creates a comment as a non-payer participant', async () => {
    const { supabase, captured } = buildSupabase({
      bill: { paid_by: 'payer' },
      billParticipant: { id: 'bp-1' },
    });
    const svc = new BillCommentsService(supabase);
    await svc.create({ bill_id: 'b-1', body: 'Me too' }, 'participant');
    const insert = captured.find((c) => c.op === 'insert');
    expect(insert).toBeDefined();
  });

  it('throws NotFoundException when parent_id comment does not exist', async () => {
    const { supabase } = buildSupabase({
      ...ACCESS_OPTS,
      parentComment: null,
    });
    const svc = new BillCommentsService(supabase);
    await expect(
      svc.create({ bill_id: 'b-1', body: 'Reply', parent_id: 'ghost-parent' }, 'payer'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when replying to a deleted parent', async () => {
    const { supabase } = buildSupabase({
      ...ACCESS_OPTS,
      parentComment: { id: 'p-1', bill_id: 'b-1', deleted_at: '2026-01-01T00:00:00Z' },
    });
    const svc = new BillCommentsService(supabase);
    await expect(
      svc.create({ bill_id: 'b-1', body: 'Reply', parent_id: 'p-1' }, 'payer'),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('BillCommentsService.update', () => {
  const ownComment = { id: 'c-1', user_id: 'user-1', body: 'original', deleted_at: null };

  it('throws NotFoundException when comment does not exist', async () => {
    const { supabase } = buildSupabase({ comment: null });
    const svc = new BillCommentsService(supabase);
    await expect(svc.update('c-1', { body: 'new' }, 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when caller is not the comment author', async () => {
    const { supabase } = buildSupabase({ comment: ownComment });
    const svc = new BillCommentsService(supabase);
    await expect(svc.update('c-1', { body: 'new' }, 'other-user')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when editing a soft-deleted comment', async () => {
    const { supabase } = buildSupabase({ comment: { ...ownComment, deleted_at: '2026-01-01T00:00:00Z' } });
    const svc = new BillCommentsService(supabase);
    await expect(svc.update('c-1', { body: 'new' }, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('updates the body when caller owns the comment', async () => {
    const { supabase, captured } = buildSupabase({ comment: ownComment });
    const svc = new BillCommentsService(supabase);
    const result = await svc.update('c-1', { body: 'updated text' }, 'user-1');
    expect(result).toMatchObject({ body: 'updated text' });
    const updateCall = captured.find((c) => c.op === 'update');
    expect((updateCall!.payload as { body: string }).body).toBe('updated text');
  });
});

describe('BillCommentsService.softDelete', () => {
  const ownComment = { id: 'c-2', user_id: 'owner', body: 'text', deleted_at: null };

  it('throws ForbiddenException when caller does not own the comment', async () => {
    const { supabase } = buildSupabase({ comment: ownComment });
    const svc = new BillCommentsService(supabase);
    await expect(svc.softDelete('c-2', 'not-owner')).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when comment is already deleted', async () => {
    const { supabase } = buildSupabase({ comment: { ...ownComment, deleted_at: '2026-01-01T00:00:00Z' } });
    const svc = new BillCommentsService(supabase);
    await expect(svc.softDelete('c-2', 'owner')).rejects.toThrow(BadRequestException);
  });

  it('sets deleted_at when the owner deletes their comment', async () => {
    const { supabase, captured } = buildSupabase({ comment: ownComment });
    const svc = new BillCommentsService(supabase);
    await svc.softDelete('c-2', 'owner');
    const updateCall = captured.find((c) => c.op === 'update');
    expect(updateCall).toBeDefined();
    expect((updateCall!.payload as { deleted_at: string }).deleted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('BillCommentsService — buildThreaded (via listForBill)', () => {
  it('nests replies under their parent comment', async () => {
    const comments = [
      { id: 'root-1', bill_id: 'b-1', user_id: 'user-1', body: 'Root', parent_id: null, deleted_at: null },
      { id: 'reply-1', bill_id: 'b-1', user_id: 'user-2', body: 'Reply', parent_id: 'root-1', deleted_at: null },
    ];

    const { supabase } = buildSupabase({
      bill: { paid_by: 'user-1' },
      commentsList: comments,
    });
    const svc = new BillCommentsService(supabase);
    const result = await svc.listForBill('b-1', 'user-1');

    expect(result).toHaveLength(1); // only root at top level
    const root = result[0];
    expect((root.replies as unknown[]).length).toBe(1);
    expect((root.replies as Array<{ id: string }>)[0].id).toBe('reply-1');
  });

  it('includes orphaned replies at root level', async () => {
    // Parent is missing (soft-deleted and excluded by the query filter)
    const comments = [
      { id: 'orphan', bill_id: 'b-1', user_id: 'user-1', body: 'Orphan', parent_id: 'gone-parent', deleted_at: null },
    ];
    const { supabase } = buildSupabase({
      bill: { paid_by: 'user-1' },
      commentsList: comments,
    });
    const svc = new BillCommentsService(supabase);
    const result = await svc.listForBill('b-1', 'user-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('orphan');
  });
});
