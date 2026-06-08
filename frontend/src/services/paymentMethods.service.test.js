vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../lib/api';
import { paymentMethodsService } from './paymentMethods.service';

beforeEach(() => vi.clearAllMocks());

describe('paymentMethodsService', () => {
  describe('listMy()', () => {
    it('calls GET /users/me/payment-methods', async () => {
      api.get.mockResolvedValue({ data: [] });
      await paymentMethodsService.listMy();
      expect(api.get).toHaveBeenCalledWith('/users/me/payment-methods');
    });

    it('unwraps { data: [] } wrapper from the response', async () => {
      const methods = [{ id: 'pm_1', type: 'bank' }];
      api.get.mockResolvedValue({ data: methods });
      const result = await paymentMethodsService.listMy();
      expect(result).toEqual(methods);
    });

    it('falls back to bare array when response has no data wrapper', async () => {
      const methods = [{ id: 'pm_1' }];
      api.get.mockResolvedValue(methods);
      const result = await paymentMethodsService.listMy();
      expect(result).toEqual(methods);
    });

    it('returns empty array when response is null', async () => {
      api.get.mockResolvedValue(null);
      const result = await paymentMethodsService.listMy();
      expect(result).toEqual([]);
    });
  });

  describe('create()', () => {
    it('calls POST /users/me/payment-methods with dto', async () => {
      const dto = { type: 'gopay', label: 'GoPay Utama', phone: '081234567890', is_primary: true };
      api.post.mockResolvedValue({ id: 'pm_new', ...dto });
      await paymentMethodsService.create(dto);
      expect(api.post).toHaveBeenCalledWith('/users/me/payment-methods', dto);
    });
  });

  describe('update()', () => {
    it('calls PUT /users/me/payment-methods/:id with dto', async () => {
      const dto = { label: 'GoPay Updated' };
      api.put.mockResolvedValue({ id: 'pm_1', ...dto });
      await paymentMethodsService.update('pm_1', dto);
      expect(api.put).toHaveBeenCalledWith('/users/me/payment-methods/pm_1', dto);
    });
  });

  describe('delete()', () => {
    it('calls DELETE /users/me/payment-methods/:id', async () => {
      api.delete.mockResolvedValue(null);
      await paymentMethodsService.delete('pm_1');
      expect(api.delete).toHaveBeenCalledWith('/users/me/payment-methods/pm_1');
    });
  });

  describe('listForUser()', () => {
    it('calls GET /users/:userId/payment-methods', async () => {
      api.get.mockResolvedValue({ data: [] });
      await paymentMethodsService.listForUser('u1');
      expect(api.get).toHaveBeenCalledWith('/users/u1/payment-methods');
    });

    it('unwraps data wrapper', async () => {
      const methods = [{ id: 'pm_2', type: 'ovo' }];
      api.get.mockResolvedValue({ data: methods });
      const result = await paymentMethodsService.listForUser('u1');
      expect(result).toEqual(methods);
    });
  });
});
