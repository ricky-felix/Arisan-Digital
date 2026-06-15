/**
 * storage.service.js — unit tests
 *
 * Mocks src/lib/api so no real HTTP calls are made.
 */

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../lib/api';
import { storageService } from './storage.service';

beforeEach(() => vi.clearAllMocks());

describe('storageService', () => {
  it('getUploadUrl() → POST /storage/upload-url with data', async () => {
    const data = { bucket: 'avatars', filename: 'me.jpg', content_type: 'image/jpeg' };
    api.post.mockResolvedValue({ bucket: 'avatars', path: 'u1/me.jpg', signed_url: 'https://s3.example.com/upload', token: 'tok' });
    await storageService.getUploadUrl(data);
    expect(api.post).toHaveBeenCalledWith('/storage/upload-url', data);
  });

  it('getReadUrl() → POST /storage/read-url with data', async () => {
    const data = { bucket: 'avatars', path: 'u1/me.jpg' };
    api.post.mockResolvedValue({ signed_url: 'https://s3.example.com/read', expires_at: '2026-07-01T00:00:00Z' });
    await storageService.getReadUrl(data);
    expect(api.post).toHaveBeenCalledWith('/storage/read-url', data);
  });

  it('getReadUrl() with expires_in_seconds → POST /storage/read-url', async () => {
    const data = { bucket: 'receipts', path: 'u1/rec.jpg', expires_in_seconds: 7200 };
    api.post.mockResolvedValue({ signed_url: 'https://s3.example.com/read2', expires_at: '2026-07-01T02:00:00Z' });
    await storageService.getReadUrl(data);
    expect(api.post).toHaveBeenCalledWith('/storage/read-url', data);
  });

  it('deleteObject() → DELETE /storage/object with data', async () => {
    const data = { bucket: 'avatars', path: 'u1/me.jpg' };
    api.delete.mockResolvedValue({ ok: true });
    await storageService.deleteObject(data);
    expect(api.delete).toHaveBeenCalledWith('/storage/object', data);
  });
});
