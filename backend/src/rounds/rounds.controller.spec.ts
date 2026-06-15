import { Test, TestingModule } from '@nestjs/testing';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<RoundsService> {
  return {
    listForGroup: jest.fn(),
    findOne: jest.fn(),
    setRecipient: jest.fn(),
    activate: jest.fn(),
    complete: jest.fn(),
  } as unknown as jest.Mocked<RoundsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: RoundsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [RoundsController],
    providers: [{ provide: RoundsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<RoundsController>(RoundsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('RoundsController', () => {
  let controller: RoundsController;
  let service: jest.Mocked<RoundsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('listForGroup', () => {
    it('delegates to service.listForGroup with groupId', async () => {
      const rounds = [{ id: 'r-1' }, { id: 'r-2' }];
      service.listForGroup.mockResolvedValue(rounds as never);

      const result = await controller.listForGroup('g-1');

      expect(service.listForGroup).toHaveBeenCalledWith('g-1');
      expect(result).toBe(rounds);
    });
  });

  describe('findOne', () => {
    it('delegates to service.findOne with id', async () => {
      const round = { id: 'r-1' };
      service.findOne.mockResolvedValue(round as never);

      const result = await controller.findOne('r-1');

      expect(service.findOne).toHaveBeenCalledWith('r-1');
      expect(result).toBe(round);
    });
  });

  describe('setRecipient', () => {
    it('delegates to service.setRecipient with id, recipient_id, and user id', async () => {
      const updated = { id: 'r-1', recipient_id: 'user-2' };
      service.setRecipient.mockResolvedValue(updated as never);

      const result = await controller.setRecipient('r-1', { recipient_id: 'user-2' }, mockUser);

      expect(service.setRecipient).toHaveBeenCalledWith('r-1', 'user-2', 'user-1');
      expect(result).toBe(updated);
    });
  });

  describe('activate', () => {
    it('delegates to service.activate with id and user id', async () => {
      const round = { id: 'r-1', status: 'active' };
      service.activate.mockResolvedValue(round as never);

      const result = await controller.activate('r-1', mockUser);

      expect(service.activate).toHaveBeenCalledWith('r-1', 'user-1');
      expect(result).toBe(round);
    });
  });

  describe('complete', () => {
    it('delegates to service.complete with id and user id', async () => {
      const round = { id: 'r-1', status: 'completed' };
      service.complete.mockResolvedValue(round as never);

      const result = await controller.complete('r-1', mockUser);

      expect(service.complete).toHaveBeenCalledWith('r-1', 'user-1');
      expect(result).toBe(round);
    });
  });
});
