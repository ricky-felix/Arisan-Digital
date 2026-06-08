vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '../lib/api';
import { notificationsService } from './notifications.service';

beforeEach(() => vi.clearAllMocks());

describe('notificationsService', () => {
  it('list() → GET /notifications', async () => {
    api.get.mockResolvedValue([]);
    await notificationsService.list();
    expect(api.get).toHaveBeenCalledWith('/notifications');
  });

  it('getUnreadCount() → GET /notifications/unread-count', async () => {
    api.get.mockResolvedValue({ count: 3 });
    const result = await notificationsService.getUnreadCount();
    expect(api.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result).toEqual({ count: 3 });
  });

  it('markRead() → POST /notifications/:id/read', async () => {
    api.post.mockResolvedValue({ is_read: true });
    await notificationsService.markRead('n1');
    expect(api.post).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('markAllRead() → POST /notifications/read-all', async () => {
    api.post.mockResolvedValue({ updated: 5 });
    await notificationsService.markAllRead();
    expect(api.post).toHaveBeenCalledWith('/notifications/read-all');
  });
});
