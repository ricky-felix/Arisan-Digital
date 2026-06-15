/**
 * payments.service.js — unit tests
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
import { paymentsService } from './payments.service';

beforeEach(() => vi.clearAllMocks());

describe('paymentsService', () => {
  it('getMine() → GET /payments/me', async () => {
    api.get.mockResolvedValue([]);
    await paymentsService.getMine();
    expect(api.get).toHaveBeenCalledWith('/payments/me');
  });

  it('getForGroup() → GET /payments/group/:groupId', async () => {
    api.get.mockResolvedValue([]);
    await paymentsService.getForGroup('g1');
    expect(api.get).toHaveBeenCalledWith('/payments/group/g1');
  });

  it('getForRound() → GET /payments/round/:roundId', async () => {
    api.get.mockResolvedValue([]);
    await paymentsService.getForRound('r1');
    expect(api.get).toHaveBeenCalledWith('/payments/round/r1');
  });

  it('create() → POST /payments with data', async () => {
    const data = { round_id: 'r1', amount: 500000, proof_url: null, notes: '' };
    api.post.mockResolvedValue({ id: 'p1' });
    await paymentsService.create(data);
    expect(api.post).toHaveBeenCalledWith('/payments', data);
  });

  it('confirm() → PATCH /payments/:id/confirm', async () => {
    api.patch.mockResolvedValue({ status: 'confirmed' });
    await paymentsService.confirm('p1');
    expect(api.patch).toHaveBeenCalledWith('/payments/p1/confirm');
  });

  it('reject() → PATCH /payments/:id/reject with data', async () => {
    const data = { reason: 'Bukti tidak jelas' };
    api.patch.mockResolvedValue({ status: 'rejected' });
    await paymentsService.reject('p1', data);
    expect(api.patch).toHaveBeenCalledWith('/payments/p1/reject', data);
  });
});
