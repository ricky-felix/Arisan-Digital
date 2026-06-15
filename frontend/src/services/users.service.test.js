/**
 * users.service.js — unit tests
 *
 * Mocks src/lib/api so no real HTTP calls are made.
 */

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../lib/api';
import { usersService } from './users.service';

beforeEach(() => vi.clearAllMocks());

describe('usersService', () => {
  // ── Profile ───────────────────────────────────────────────────────────────

  it('getMe() → GET /users/me', async () => {
    api.get.mockResolvedValue({ id: 'u1', name: 'Budi' });
    await usersService.getMe();
    expect(api.get).toHaveBeenCalledWith('/users/me');
  });

  it('getProfile() is an alias for getMe() → GET /users/me', async () => {
    api.get.mockResolvedValue({ id: 'u1' });
    await usersService.getProfile();
    expect(api.get).toHaveBeenCalledWith('/users/me');
  });

  it('updateMe() → PATCH /users/me with data', async () => {
    const data = { name: 'Budi Santoso', phone: '08123456789' };
    api.patch.mockResolvedValue({ id: 'u1', ...data });
    await usersService.updateMe(data);
    expect(api.patch).toHaveBeenCalledWith('/users/me', data);
  });

  it('updateProfile() is an alias for updateMe() → PATCH /users/me', async () => {
    const data = { avatar_url: 'https://example.com/avatar.jpg' };
    api.patch.mockResolvedValue({ id: 'u1', ...data });
    await usersService.updateProfile(data);
    expect(api.patch).toHaveBeenCalledWith('/users/me', data);
  });

  // ── Security / PIN ────────────────────────────────────────────────────────

  it('getSecurity() → GET /users/me/security', async () => {
    api.get.mockResolvedValue({ has_pin: true, app_lock_enabled: false });
    await usersService.getSecurity();
    expect(api.get).toHaveBeenCalledWith('/users/me/security');
  });

  it('setPin() → PATCH /users/me/pin with { pin }', async () => {
    api.patch.mockResolvedValue({ success: true });
    await usersService.setPin('123456');
    expect(api.patch).toHaveBeenCalledWith('/users/me/pin', { pin: '123456' });
  });

  it('verifyPin() → POST /users/me/pin/verify with { pin }', async () => {
    api.post.mockResolvedValue({ valid: true });
    await usersService.verifyPin('123456');
    expect(api.post).toHaveBeenCalledWith('/users/me/pin/verify', { pin: '123456' });
  });

  it('updateSecurity() → PATCH /users/me/security with data', async () => {
    const data = { app_lock_enabled: true };
    api.patch.mockResolvedValue({ has_pin: true, app_lock_enabled: true });
    await usersService.updateSecurity(data);
    expect(api.patch).toHaveBeenCalledWith('/users/me/security', data);
  });

  // ── Bank account ─────────────────────────────────────────────────────────

  it('getBankAccount() → GET /users/me/bank-account', async () => {
    api.get.mockResolvedValue({ bank: 'BCA', account_number: '1234567890' });
    await usersService.getBankAccount();
    expect(api.get).toHaveBeenCalledWith('/users/me/bank-account');
  });

  it('saveBankAccount() → PUT /users/me/bank-account with data', async () => {
    const data = { bank: 'BNI', account_number: '987654321', holder_name: 'Budi' };
    api.put.mockResolvedValue({ id: 'ba1', ...data });
    await usersService.saveBankAccount(data);
    expect(api.put).toHaveBeenCalledWith('/users/me/bank-account', data);
  });

  it('deleteBankAccount() → DELETE /users/me/bank-account', async () => {
    api.delete.mockResolvedValue({ success: true });
    await usersService.deleteBankAccount();
    expect(api.delete).toHaveBeenCalledWith('/users/me/bank-account');
  });
});
