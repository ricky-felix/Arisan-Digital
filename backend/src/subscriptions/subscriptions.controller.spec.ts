import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import type { CreateGroupSubscriptionDto } from './dto/create-group-subscription.dto';
import type { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<SubscriptionsService> {
  return {
    getActiveForUser: jest.fn(),
    createUserSubscription: jest.fn(),
    cancel: jest.fn(),
    getActiveForGroup: jest.fn(),
    createGroupSubscription: jest.fn(),
    cancelGroup: jest.fn(),
    expireDue: jest.fn(),
    activateAndExtendUserSub: jest.fn(),
    activateAndExtendGroupSub: jest.fn(),
  } as unknown as jest.Mocked<SubscriptionsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };
const adminUser: AuthUser = { id: 'admin-1', email: 'a@b.com', platform_role: 'super_admin' };

async function buildModule(service: SubscriptionsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [SubscriptionsController],
    providers: [{ provide: SubscriptionsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<SubscriptionsController>(SubscriptionsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: jest.Mocked<SubscriptionsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('getMySubscription', () => {
    it('delegates to service.getActiveForUser with user id', async () => {
      const sub = { id: 'sub-1', plan_slug: 'boss' };
      service.getActiveForUser.mockResolvedValue(sub as never);

      const result = await controller.getMySubscription(mockUser);

      expect(service.getActiveForUser).toHaveBeenCalledWith('user-1');
      expect(result).toBe(sub);
    });
  });

  describe('createMySubscription', () => {
    it('delegates to service.createUserSubscription with dto and user id', async () => {
      const dto: CreateUserSubscriptionDto = { plan_slug: 'boss', billing_cycle: 'monthly' } as never;
      const sub = { id: 'sub-1' };
      service.createUserSubscription.mockResolvedValue(sub as never);

      const result = await controller.createMySubscription(mockUser, dto);

      expect(service.createUserSubscription).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(sub);
    });
  });

  describe('cancelMySubscription', () => {
    it('delegates to service.cancel with user id and dto', async () => {
      const dto: CancelSubscriptionDto = { reason: 'Not needed' } as never;
      service.cancel.mockResolvedValue({ cancelled: true } as never);

      const result = await controller.cancelMySubscription(mockUser, dto);

      expect(service.cancel).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ cancelled: true });
    });
  });

  describe('getGroupSubscription', () => {
    it('delegates to service.getActiveForGroup with groupId', async () => {
      const sub = { id: 'gsub-1', group_id: 'g-1' };
      service.getActiveForGroup.mockResolvedValue(sub as never);

      const result = await controller.getGroupSubscription('g-1');

      expect(service.getActiveForGroup).toHaveBeenCalledWith('g-1');
      expect(result).toBe(sub);
    });
  });

  describe('createGroupSubscription', () => {
    it('overrides group_id from URL param into dto', async () => {
      const dto: CreateGroupSubscriptionDto = { plan_slug: 'boss', billing_cycle: 'yearly', group_id: 'wrong-id' } as never;
      const sub = { id: 'gsub-1' };
      service.createGroupSubscription.mockResolvedValue(sub as never);

      const result = await controller.createGroupSubscription('g-correct', mockUser, dto);

      expect(service.createGroupSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ group_id: 'g-correct' }),
        'user-1',
      );
      expect(result).toBe(sub);
    });
  });

  describe('cancelGroupSubscription', () => {
    it('delegates to service.cancelGroup with groupId, user id, and dto', async () => {
      const dto: CancelSubscriptionDto = { reason: 'Cost' } as never;
      service.cancelGroup.mockResolvedValue({ cancelled: true } as never);

      const result = await controller.cancelGroupSubscription('g-1', mockUser, dto);

      expect(service.cancelGroup).toHaveBeenCalledWith('g-1', 'user-1', dto);
    });
  });

  describe('expireDue', () => {
    it('calls service.expireDue with current date', async () => {
      service.expireDue.mockResolvedValue({ expired_count: 2 } as never);

      const result = await controller.expireDue();

      expect(service.expireDue).toHaveBeenCalledWith(expect.any(Date));
      expect(result).toEqual({ expired_count: 2 });
    });
  });
});
