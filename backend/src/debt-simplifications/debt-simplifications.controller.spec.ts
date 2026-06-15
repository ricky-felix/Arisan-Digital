import { Test, TestingModule } from '@nestjs/testing';
import { DebtSimplificationsController } from './debt-simplifications.controller';
import { DebtSimplificationsService } from './debt-simplifications.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<DebtSimplificationsService> {
  return {
    simplifyBill: jest.fn(),
    listForBill: jest.fn(),
    markSettled: jest.fn(),
    dismiss: jest.fn(),
  } as unknown as jest.Mocked<DebtSimplificationsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: DebtSimplificationsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [DebtSimplificationsController],
    providers: [{ provide: DebtSimplificationsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<DebtSimplificationsController>(DebtSimplificationsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('DebtSimplificationsController', () => {
  let controller: DebtSimplificationsController;
  let service: jest.Mocked<DebtSimplificationsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('simplifyBill', () => {
    it('delegates to service.simplifyBill with billId and user id', async () => {
      const edges = [{ from_user_id: 'u-1', to_user_id: 'u-2', amount: 30_000 }];
      service.simplifyBill.mockResolvedValue(edges as never);

      const result = await controller.simplifyBill('bill-1', mockUser);

      expect(service.simplifyBill).toHaveBeenCalledWith('bill-1', 'user-1');
      expect(result).toBe(edges);
    });
  });

  describe('listForBill', () => {
    it('delegates to service.listForBill with billId and user id', async () => {
      const debts = [{ id: 'd-1' }];
      service.listForBill.mockResolvedValue(debts as never);

      const result = await controller.listForBill('bill-1', mockUser);

      expect(service.listForBill).toHaveBeenCalledWith('bill-1', 'user-1');
      expect(result).toBe(debts);
    });
  });

  describe('markSettled', () => {
    it('delegates to service.markSettled with id and user id', async () => {
      const settled = { id: 'd-1', status: 'settled' };
      service.markSettled.mockResolvedValue(settled as never);

      const result = await controller.markSettled('d-1', mockUser);

      expect(service.markSettled).toHaveBeenCalledWith('d-1', 'user-1');
      expect(result).toBe(settled);
    });
  });

  describe('dismiss', () => {
    it('delegates to service.dismiss with id and user id', async () => {
      const dismissed = { id: 'd-1', status: 'dismissed' };
      service.dismiss.mockResolvedValue(dismissed as never);

      const result = await controller.dismiss('d-1', mockUser);

      expect(service.dismiss).toHaveBeenCalledWith('d-1', 'user-1');
      expect(result).toBe(dismissed);
    });
  });
});
