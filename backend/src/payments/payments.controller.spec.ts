import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreatePaymentDto } from './dto/create-payment.dto';
import type { RejectPaymentDto } from './dto/reject-payment.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<PaymentsService> {
  return {
    findMine: jest.fn(),
    findForGroup: jest.fn(),
    findForRound: jest.fn(),
    create: jest.fn(),
    confirm: jest.fn(),
    reject: jest.fn(),
  } as unknown as jest.Mocked<PaymentsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: PaymentsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [PaymentsController],
    providers: [{ provide: PaymentsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<PaymentsController>(PaymentsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('findMine', () => {
    it('delegates to service.findMine with user id', async () => {
      const payments = [{ id: 'p-1' }];
      service.findMine.mockResolvedValue(payments as never);

      const result = await controller.findMine(mockUser);

      expect(service.findMine).toHaveBeenCalledWith('user-1');
      expect(result).toBe(payments);
    });
  });

  describe('findForGroup', () => {
    it('delegates to service.findForGroup with groupId', async () => {
      const payments = [{ id: 'p-1' }];
      service.findForGroup.mockResolvedValue(payments as never);

      const result = await controller.findForGroup('g-1');

      expect(service.findForGroup).toHaveBeenCalledWith('g-1');
      expect(result).toBe(payments);
    });
  });

  describe('findForRound', () => {
    it('delegates to service.findForRound with roundId', async () => {
      const payments = [{ id: 'p-1' }];
      service.findForRound.mockResolvedValue(payments as never);

      const result = await controller.findForRound('r-1');

      expect(service.findForRound).toHaveBeenCalledWith('r-1');
      expect(result).toBe(payments);
    });
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto = { round_id: 'r-1', amount: 100_000 } as unknown as CreatePaymentDto;
      const payment = { id: 'p-1' };
      service.create.mockResolvedValue(payment as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(payment);
    });
  });

  describe('confirm', () => {
    it('delegates to service.confirm with id and user id', async () => {
      const payment = { id: 'p-1', status: 'confirmed' };
      service.confirm.mockResolvedValue(payment as never);

      const result = await controller.confirm('p-1', mockUser);

      expect(service.confirm).toHaveBeenCalledWith('p-1', 'user-1');
      expect(result).toBe(payment);
    });
  });

  describe('reject', () => {
    it('delegates to service.reject with id, dto, and user id', async () => {
      const dto: RejectPaymentDto = { rejection_reason: 'Wrong amount here' };
      const payment = { id: 'p-1', status: 'rejected' };
      service.reject.mockResolvedValue(payment as never);

      const result = await controller.reject('p-1', dto, mockUser);

      expect(service.reject).toHaveBeenCalledWith('p-1', dto, 'user-1');
      expect(result).toBe(payment);
    });
  });
});
