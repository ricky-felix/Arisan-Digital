/**
 * bills.service.js — unit tests
 *
 * Mocks src/lib/api so no real HTTP calls are made.
 */

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../lib/api';
import {
  billsService,
  billParticipantsService,
  billSettlementsService,
  billCommentsService,
  recurringBillsService,
  debtSimplificationService,
} from './bills.service';

beforeEach(() => vi.clearAllMocks());

// ── billsService ──────────────────────────────────────────────────────────────

describe('billsService', () => {
  it('list() → GET /bills', async () => {
    api.get.mockResolvedValue([]);
    await billsService.list();
    expect(api.get).toHaveBeenCalledWith('/bills');
  });

  it('getById() → GET /bills/:id', async () => {
    api.get.mockResolvedValue({ id: 'b1' });
    await billsService.getById('b1');
    expect(api.get).toHaveBeenCalledWith('/bills/b1');
  });

  it('create() → POST /bills with data', async () => {
    const data = { title: 'Makan Siang', total_amount: 100000 };
    api.post.mockResolvedValue({ id: 'new-bill', ...data });
    await billsService.create(data);
    expect(api.post).toHaveBeenCalledWith('/bills', data);
  });

  it('update() → PATCH /bills/:id', async () => {
    const data = { title: 'Updated' };
    api.patch.mockResolvedValue({ id: 'b1', ...data });
    await billsService.update('b1', data);
    expect(api.patch).toHaveBeenCalledWith('/bills/b1', data);
  });

  it('delete() → DELETE /bills/:id', async () => {
    api.delete.mockResolvedValue(null);
    await billsService.delete('b1');
    expect(api.delete).toHaveBeenCalledWith('/bills/b1');
  });

  it('markSettled() → PATCH /bills/:id/settle', async () => {
    api.patch.mockResolvedValue({ status: 'settled' });
    await billsService.markSettled('b1');
    expect(api.patch).toHaveBeenCalledWith('/bills/b1/settle');
  });
});

// ── billParticipantsService ───────────────────────────────────────────────────

describe('billParticipantsService', () => {
  it('add() → POST /bills/:billId/participants', async () => {
    const data = { user_id: 'u1', share_amount: 25000 };
    api.post.mockResolvedValue({ id: 'p1' });
    await billParticipantsService.add('b1', data);
    expect(api.post).toHaveBeenCalledWith('/bills/b1/participants', data);
  });

  it('remove() → DELETE /bills/:billId/participants/:participantId', async () => {
    api.delete.mockResolvedValue(null);
    await billParticipantsService.remove('b1', 'p1');
    expect(api.delete).toHaveBeenCalledWith('/bills/b1/participants/p1');
  });
});

// ── billSettlementsService ────────────────────────────────────────────────────

describe('billSettlementsService', () => {
  it('list() → GET /settlements/bill/:billId', async () => {
    api.get.mockResolvedValue([]);
    await billSettlementsService.list('b1');
    expect(api.get).toHaveBeenCalledWith('/settlements/bill/b1');
  });

  it('getMine() → GET /settlements/me', async () => {
    api.get.mockResolvedValue([]);
    await billSettlementsService.getMine();
    expect(api.get).toHaveBeenCalledWith('/settlements/me');
  });

  it('create() → POST /settlements with data', async () => {
    const data = { bill_id: 'b1', from_user_id: 'u1', to_user_id: 'u2', amount: 50000 };
    api.post.mockResolvedValue({ id: 's1' });
    await billSettlementsService.create(data);
    expect(api.post).toHaveBeenCalledWith('/settlements', data);
  });

  it('confirm() → PATCH /settlements/:id/confirm', async () => {
    api.patch.mockResolvedValue({ status: 'confirmed' });
    await billSettlementsService.confirm('s1');
    expect(api.patch).toHaveBeenCalledWith('/settlements/s1/confirm');
  });

  it('reject() → PATCH /settlements/:id/reject with data', async () => {
    const data = { reason: 'Bukti tidak valid' };
    api.patch.mockResolvedValue({ status: 'rejected' });
    await billSettlementsService.reject('s1', data);
    expect(api.patch).toHaveBeenCalledWith('/settlements/s1/reject', data);
  });
});

// ── billCommentsService ───────────────────────────────────────────────────────

describe('billCommentsService', () => {
  it('list() → GET /bills/:billId/comments', async () => {
    api.get.mockResolvedValue([]);
    await billCommentsService.list('b1');
    expect(api.get).toHaveBeenCalledWith('/bills/b1/comments');
  });

  it('create() → POST /bills/:billId/comments', async () => {
    const data = { content: 'Sudah transfer ya' };
    api.post.mockResolvedValue({ id: 'c1' });
    await billCommentsService.create('b1', data);
    expect(api.post).toHaveBeenCalledWith('/bills/b1/comments', data);
  });

  it('update() → PATCH /bills/:billId/comments/:commentId', async () => {
    const data = { content: 'Diupdate' };
    api.patch.mockResolvedValue({ id: 'c1', ...data });
    await billCommentsService.update('b1', 'c1', data);
    expect(api.patch).toHaveBeenCalledWith('/bills/b1/comments/c1', data);
  });

  it('delete() → DELETE /bills/:billId/comments/:commentId', async () => {
    api.delete.mockResolvedValue(null);
    await billCommentsService.delete('b1', 'c1');
    expect(api.delete).toHaveBeenCalledWith('/bills/b1/comments/c1');
  });
});

// ── recurringBillsService ─────────────────────────────────────────────────────

describe('recurringBillsService', () => {
  it('list() → GET /recurring-bills', async () => {
    api.get.mockResolvedValue([]);
    await recurringBillsService.list();
    expect(api.get).toHaveBeenCalledWith('/recurring-bills');
  });

  it('getById() → GET /recurring-bills/:id', async () => {
    api.get.mockResolvedValue({ id: 'rb1' });
    await recurringBillsService.getById('rb1');
    expect(api.get).toHaveBeenCalledWith('/recurring-bills/rb1');
  });

  it('create() → POST /recurring-bills', async () => {
    const data = { title: 'Langganan Netflix', amount: 60000 };
    api.post.mockResolvedValue({ id: 'rb1' });
    await recurringBillsService.create(data);
    expect(api.post).toHaveBeenCalledWith('/recurring-bills', data);
  });

  it('update() → PATCH /recurring-bills/:id', async () => {
    api.patch.mockResolvedValue({ updated: true });
    await recurringBillsService.update('rb1', { amount: 65000 });
    expect(api.patch).toHaveBeenCalledWith('/recurring-bills/rb1', { amount: 65000 });
  });

  it('delete() → DELETE /recurring-bills/:id', async () => {
    api.delete.mockResolvedValue(null);
    await recurringBillsService.delete('rb1');
    expect(api.delete).toHaveBeenCalledWith('/recurring-bills/rb1');
  });
});

// ── debtSimplificationService ─────────────────────────────────────────────────

describe('debtSimplificationService', () => {
  it('calculate() → GET /debt-simplifications/bill/:billId', async () => {
    api.get.mockResolvedValue({ flows: [] });
    await debtSimplificationService.calculate('b1');
    expect(api.get).toHaveBeenCalledWith('/debt-simplifications/bill/b1');
  });

  it('apply() → POST /debt-simplifications/bill/:billId/apply', async () => {
    api.post.mockResolvedValue({ applied: true });
    await debtSimplificationService.apply('b1');
    expect(api.post).toHaveBeenCalledWith('/debt-simplifications/bill/b1/apply');
  });
});
