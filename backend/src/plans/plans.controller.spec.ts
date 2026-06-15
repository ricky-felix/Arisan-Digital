import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UpsertPlanDto } from './dto/upsert-plan.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<PlansService> {
  return {
    listActive: jest.fn(),
    getBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  } as unknown as jest.Mocked<PlansService>;
}

async function buildModule(service: PlansService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [PlansController],
    providers: [{ provide: PlansService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<PlansController>(PlansController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('PlansController', () => {
  let controller: PlansController;
  let service: jest.Mocked<PlansService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('listActive', () => {
    it('delegates to service.listActive', async () => {
      const plans = [{ slug: 'free' }, { slug: 'boss' }];
      service.listActive.mockResolvedValue(plans as never);

      const result = await controller.listActive();

      expect(service.listActive).toHaveBeenCalled();
      expect(result).toBe(plans);
    });
  });

  describe('getBySlug', () => {
    it('delegates to service.getBySlug with slug', async () => {
      const plan = { slug: 'boss', price_monthly: 50_000 };
      service.getBySlug.mockResolvedValue(plan as never);

      const result = await controller.getBySlug('boss');

      expect(service.getBySlug).toHaveBeenCalledWith('boss');
      expect(result).toBe(plan);
    });
  });

  describe('create', () => {
    it('delegates to service.create with dto', async () => {
      const dto: UpsertPlanDto = { slug: 'enterprise', name: 'Enterprise' } as never;
      const plan = { slug: 'enterprise' };
      service.create.mockResolvedValue(plan as never);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(plan);
    });
  });

  describe('update', () => {
    it('delegates to service.update with slug and dto', async () => {
      const dto: UpsertPlanDto = { name: 'Boss Updated' } as never;
      const updated = { slug: 'boss', name: 'Boss Updated' };
      service.update.mockResolvedValue(updated as never);

      const result = await controller.update('boss', dto);

      expect(service.update).toHaveBeenCalledWith('boss', dto);
      expect(result).toBe(updated);
    });
  });

  describe('deactivate', () => {
    it('delegates to service.deactivate with slug', async () => {
      service.deactivate.mockResolvedValue({ slug: 'boss', is_active: false } as never);

      const result = await controller.deactivate('boss');

      expect(service.deactivate).toHaveBeenCalledWith('boss');
      expect(result).toEqual({ slug: 'boss', is_active: false });
    });
  });
});
