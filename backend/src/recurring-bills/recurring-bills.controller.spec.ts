import { Test, TestingModule } from '@nestjs/testing';
import { RecurringBillsController } from './recurring-bills.controller';
import { RecurringBillsService } from './recurring-bills.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateRecurringBillDto } from './dto/create-recurring-bill.dto';
import type { UpdateRecurringBillDto } from './dto/update-recurring-bill.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<RecurringBillsService> {
  return {
    create: jest.fn(),
    listMine: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    materializeDue: jest.fn(),
  } as unknown as jest.Mocked<RecurringBillsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: RecurringBillsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [RecurringBillsController],
    providers: [{ provide: RecurringBillsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<RecurringBillsController>(RecurringBillsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('RecurringBillsController', () => {
  let controller: RecurringBillsController;
  let service: jest.Mocked<RecurringBillsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto = { title: 'Netflix', frequency: 'monthly' } as unknown as CreateRecurringBillDto;
      const rb = { id: 'rb-1' };
      service.create.mockResolvedValue(rb as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(rb);
    });
  });

  describe('listMine', () => {
    it('delegates to service.listMine with user id', async () => {
      const list = [{ id: 'rb-1' }];
      service.listMine.mockResolvedValue(list as never);

      const result = await controller.listMine(mockUser);

      expect(service.listMine).toHaveBeenCalledWith('user-1');
      expect(result).toBe(list);
    });
  });

  describe('findOne', () => {
    it('delegates to service.findOne with id and user id', async () => {
      const rb = { id: 'rb-1' };
      service.findOne.mockResolvedValue(rb as never);

      const result = await controller.findOne('rb-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('rb-1', 'user-1');
      expect(result).toBe(rb);
    });
  });

  describe('update', () => {
    it('delegates to service.update with id, dto, and user id', async () => {
      const dto: UpdateRecurringBillDto = { title: 'Spotify' };
      const updated = { id: 'rb-1', title: 'Spotify' };
      service.update.mockResolvedValue(updated as never);

      const result = await controller.update('rb-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('rb-1', dto, 'user-1');
      expect(result).toBe(updated);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with id and user id', async () => {
      service.delete.mockResolvedValue({ message: 'RecurringBill deleted' } as never);

      const result = await controller.delete('rb-1', mockUser);

      expect(service.delete).toHaveBeenCalledWith('rb-1', 'user-1');
      expect(result).toEqual({ message: 'RecurringBill deleted' });
    });
  });

  describe('runDue', () => {
    it('delegates to service.materializeDue with current date', async () => {
      service.materializeDue.mockResolvedValue({ created: 3 });

      const result = await controller.runDue();

      expect(service.materializeDue).toHaveBeenCalledWith(expect.any(Date));
      expect(result).toEqual({ created: 3 });
    });
  });
});
