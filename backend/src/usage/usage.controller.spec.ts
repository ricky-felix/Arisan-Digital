import { Test, TestingModule } from '@nestjs/testing';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<UsageService> {
  return {
    getCurrent: jest.fn(),
    incrementGroups: jest.fn(),
    incrementBills: jest.fn(),
  } as unknown as jest.Mocked<UsageService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: UsageService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [UsageController],
    providers: [{ provide: UsageService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<UsageController>(UsageController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('UsageController', () => {
  let controller: UsageController;
  let service: jest.Mocked<UsageService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('getCurrent', () => {
    it('delegates to service.getCurrent with user id', async () => {
      const usage = { groups_created: 2, bills_created: 5 };
      service.getCurrent.mockResolvedValue(usage as never);

      const result = await controller.getCurrent(mockUser);

      expect(service.getCurrent).toHaveBeenCalledWith('user-1');
      expect(result).toBe(usage);
    });
  });

  describe('incrementGroups', () => {
    it('calls service.incrementGroups and returns a success message', async () => {
      service.incrementGroups.mockResolvedValue(undefined);

      const result = await controller.incrementGroups(mockUser);

      expect(service.incrementGroups).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ message: 'groups_created incremented' });
    });
  });

  describe('incrementBills', () => {
    it('calls service.incrementBills and returns a success message', async () => {
      service.incrementBills.mockResolvedValue(undefined);

      const result = await controller.incrementBills(mockUser);

      expect(service.incrementBills).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ message: 'bills_created incremented' });
    });
  });
});
