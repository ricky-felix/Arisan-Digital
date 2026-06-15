/**
 * contacts.service.js — unit tests
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
import { contactsService } from './contacts.service';

beforeEach(() => vi.clearAllMocks());

describe('contactsService', () => {
  it('list() with no options → GET /contacts', async () => {
    api.get.mockResolvedValue([]);
    await contactsService.list();
    expect(api.get).toHaveBeenCalledWith('/contacts');
  });

  it('list() with sort option → GET /contacts?sort=frequency', async () => {
    api.get.mockResolvedValue([]);
    await contactsService.list({ sort: 'frequency' });
    expect(api.get).toHaveBeenCalledWith('/contacts?sort=frequency');
  });

  it('list() with limit option → GET /contacts?limit=5', async () => {
    api.get.mockResolvedValue([]);
    await contactsService.list({ limit: 5 });
    expect(api.get).toHaveBeenCalledWith('/contacts?limit=5');
  });

  it('list() with both options → GET /contacts?sort=recent&limit=12', async () => {
    api.get.mockResolvedValue([]);
    await contactsService.list({ sort: 'recent', limit: 12 });
    expect(api.get).toHaveBeenCalledWith('/contacts?sort=recent&limit=12');
  });

  it('getRecents() → GET /contacts/recents', async () => {
    api.get.mockResolvedValue([]);
    await contactsService.getRecents();
    expect(api.get).toHaveBeenCalledWith('/contacts/recents');
  });

  it('create() → POST /contacts with data', async () => {
    const data = { contact_user_id: 'u2', nickname: 'Budi' };
    api.post.mockResolvedValue({ id: 'c1' });
    await contactsService.create(data);
    expect(api.post).toHaveBeenCalledWith('/contacts', data);
  });

  it('touch() → POST /contacts/touch with data', async () => {
    const data = { contact_user_id: 'u2' };
    api.post.mockResolvedValue({ ok: true });
    await contactsService.touch(data);
    expect(api.post).toHaveBeenCalledWith('/contacts/touch', data);
  });

  it('update() → PATCH /contacts/:id with data', async () => {
    const data = { nickname: 'Budi Updated' };
    api.patch.mockResolvedValue({ id: 'c1', ...data });
    await contactsService.update('c1', data);
    expect(api.patch).toHaveBeenCalledWith('/contacts/c1', data);
  });

  it('delete() → DELETE /contacts/:id', async () => {
    api.delete.mockResolvedValue(null);
    await contactsService.delete('c1');
    expect(api.delete).toHaveBeenCalledWith('/contacts/c1');
  });
});
