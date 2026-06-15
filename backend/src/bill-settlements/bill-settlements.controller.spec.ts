import { Test, TestingModule } from '@nestjs/testing';
import { BillSettlementsController } from './bill-settlements.controller';
import { BillSettlementsService } from './bill-settlements.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateSettlementDto } from './dto/create-settlement.dto';
import type { RejectSettlementDto } from './dto/reject-settlement.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<BillSettlementsService> {
  return {
    create: jest.fn(),
    confirm: jest.fn(),
    reject: jest.fn(),
    listForBill: jest.fn(),
    listMine: jest.fn(),
  } as unknown as jest.Mocked<BillSettlementsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: BillSettlementsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [BillSettlementsController],
    providers: [{ provide: BillSettlementsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<BillSettlementsController>(BillSettlementsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('BillSettlementsController', () => {
  let controller: BillSettlementsController;
  let service: jest.Mocked<BillSettlementsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto: CreateSettlementDto = { bill_id: 'b-1', amount: 50_000 } as never;
      const settlement = { id: 's-1' };
      service.create.mockResolvedValue(settlement as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(settlement);
    });
  });

  describe('confirm', () => {
    it('delegates to service.confirm with id and user id', async () => {
      const confirmed = { id: 's-1', status: 'confirmed' };
      service.confirm.mockResolvedValue(confirmed as never);

      const result = await controller.confirm('s-1', mockUser);

      expect(service.confirm).toHaveBeenCalledWith('s-1', 'user-1');
      expect(result).toBe(confirmed);
    });
  });

  describe('reject', () => {
    it('delegates to service.reject with id, dto, and user id', async () => {
      const dto: RejectSettlementDto = { reason: 'Wrong amount' } as never;
      const rejected = { id: 's-1', status: 'rejected' };
      service.reject.mockResolvedValue(rejected as never);

      const result = await controller.reject('s-1', dto, mockUser);

      expect(service.reject).toHaveBeenCalledWith('s-1', dto, 'user-1');
      expect(result).toBe(rejected);
    });
  });

  describe('listForBill', () => {
    it('delegates to service.listForBill with billId and user id', async () => {
      const settlements = [{ id: 's-1' }];
      service.listForBill.mockResolvedValue(settlements as never);

      const result = await controller.listForBill('b-1', mockUser);

      expect(service.listForBill).toHaveBeenCalledWith('b-1', 'user-1');
      expect(result).toBe(settlements);
    });
  });

  describe('listMine', () => {
    it('delegates to service.listMine with user id', async () => {
      const settlements = [{ id: 's-1' }];
      service.listMine.mockResolvedValue(settlements as never);

      const result = await controller.listMine(mockUser);

      expect(service.listMine).toHaveBeenCalledWith('user-1');
      expect(result).toBe(settlements);
    });
  });
});
