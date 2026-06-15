import { Test, TestingModule } from '@nestjs/testing';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateBillDto } from './dto/create-bill.dto';
import type { UpdateBillDto } from './dto/update-bill.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<BillsService> {
  return {
    create: jest.fn(),
    listMine: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    markSettled: jest.fn(),
    createFromRecurring: jest.fn(),
  } as unknown as jest.Mocked<BillsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: BillsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [BillsController],
    providers: [{ provide: BillsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<BillsController>(BillsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('BillsController', () => {
  let controller: BillsController;
  let service: jest.Mocked<BillsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto = { title: 'Lunch', total_amount: 60_000, split_method: 'equal', participants: [] } as unknown as CreateBillDto;
      const bill = { id: 'b-1', title: 'Lunch' };
      service.create.mockResolvedValue(bill as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(bill);
    });
  });

  describe('listMine', () => {
    it('delegates to service.listMine with user id', async () => {
      const bills = [{ id: 'b-1' }, { id: 'b-2' }];
      service.listMine.mockResolvedValue(bills as never);

      const result = await controller.listMine(mockUser);

      expect(service.listMine).toHaveBeenCalledWith('user-1');
      expect(result).toBe(bills);
    });
  });

  describe('findOne', () => {
    it('delegates to service.findOne with id and user id', async () => {
      const bill = { id: 'b-1' };
      service.findOne.mockResolvedValue(bill as never);

      const result = await controller.findOne('b-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('b-1', 'user-1');
      expect(result).toBe(bill);
    });
  });

  describe('update', () => {
    it('delegates to service.update with id, dto, and user id', async () => {
      const dto: UpdateBillDto = { title: 'Updated' };
      const updated = { id: 'b-1', title: 'Updated' };
      service.update.mockResolvedValue(updated as never);

      const result = await controller.update('b-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('b-1', dto, 'user-1');
      expect(result).toBe(updated);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with id and user id', async () => {
      service.delete.mockResolvedValue({ message: 'deleted' } as never);

      const result = await controller.delete('b-1', mockUser);

      expect(service.delete).toHaveBeenCalledWith('b-1', 'user-1');
      expect(result).toEqual({ message: 'deleted' });
    });
  });

  describe('markSettled', () => {
    it('delegates to service.markSettled with id and user id', async () => {
      const settled = { id: 'b-1', status: 'settled' };
      service.markSettled.mockResolvedValue(settled as never);

      const result = await controller.markSettled('b-1', mockUser);

      expect(service.markSettled).toHaveBeenCalledWith('b-1', 'user-1');
      expect(result).toBe(settled);
    });
  });
});
