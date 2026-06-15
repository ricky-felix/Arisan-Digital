import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<NotificationsService> {
  return {
    listMine: jest.fn(),
    unreadCount: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  } as unknown as jest.Mocked<NotificationsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: NotificationsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [NotificationsController],
    providers: [{ provide: NotificationsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<NotificationsController>(NotificationsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('listMine', () => {
    it('delegates to service.listMine with user id', async () => {
      const notifications = [{ id: 'n-1' }, { id: 'n-2' }];
      service.listMine.mockResolvedValue(notifications as never);

      const result = await controller.listMine(mockUser);

      expect(service.listMine).toHaveBeenCalledWith('user-1');
      expect(result).toBe(notifications);
    });
  });

  describe('unreadCount', () => {
    it('delegates to service.unreadCount with user id', async () => {
      service.unreadCount.mockResolvedValue({ count: 3 } as never);

      const result = await controller.unreadCount(mockUser);

      expect(service.unreadCount).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('markRead', () => {
    it('delegates to service.markRead with notification id and user id', async () => {
      service.markRead.mockResolvedValue({ id: 'n-1', is_read: true } as never);

      const result = await controller.markRead('n-1', mockUser);

      expect(service.markRead).toHaveBeenCalledWith('n-1', 'user-1');
      expect(result).toEqual({ id: 'n-1', is_read: true });
    });
  });

  describe('markAllRead', () => {
    it('delegates to service.markAllRead with user id', async () => {
      service.markAllRead.mockResolvedValue({ updated: 5 } as never);

      const result = await controller.markAllRead(mockUser);

      expect(service.markAllRead).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ updated: 5 });
    });
  });
});
