/**
 * transactions.service.js — unit tests
 *
 * Mocks src/lib/api so no real HTTP calls are made.
 */

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../lib/api';
import { transactionsService } from './transactions.service';

beforeEach(() => vi.clearAllMocks());

describe('transactionsService', () => {
  it('getMine() → GET /transactions/me', async () => {
    api.get.mockResolvedValue([]);
    await transactionsService.getMine();
    expect(api.get).toHaveBeenCalledWith('/transactions/me');
  });

  it('returns the resolved value from the API', async () => {
    const txList = [
      { id: 'tx1', type: 'payment', amount: 500000 },
      { id: 'tx2', type: 'settlement', amount: 200000 },
    ];
    api.get.mockResolvedValue(txList);
    const result = await transactionsService.getMine();
    expect(result).toEqual(txList);
  });
});
