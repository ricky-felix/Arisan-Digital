import { Test, TestingModule } from '@nestjs/testing';
import { PaymentTransactionsController } from './payment-transactions.controller';
import { PaymentTransactionsService } from './payment-transactions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<Pick<PaymentTransactionsService, 'listMine' | 'listAll'>> {
  return {
    listMine: jest.fn(),
    listAll: jest.fn(),
  };
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };
const adminUser: AuthUser = { id: 'admin-1', email: 'admin@b.com', platform_role: 'super_admin' };

async function buildModule(service: Pick<PaymentTransactionsService, 'listMine' | 'listAll'>) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [PaymentTransactionsController],
    providers: [{ provide: PaymentTransactionsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<PaymentTransactionsController>(PaymentTransactionsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('PaymentTransactionsController', () => {
  let controller: PaymentTransactionsController;
  let service: jest.Mocked<Pick<PaymentTransactionsService, 'listMine' | 'listAll'>>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('listMine', () => {
    it('delegates to service.listMine with user id', async () => {
      const txs = [{ id: 'tx-1' }];
      service.listMine.mockResolvedValue(txs as never);

      const result = await controller.listMine(mockUser);

      expect(service.listMine).toHaveBeenCalledWith('user-1');
      expect(result).toBe(txs);
    });
  });

  describe('listAll', () => {
    it('delegates to service.listAll with no filters when no query params', async () => {
      const txs = [{ id: 'tx-1' }, { id: 'tx-2' }];
      service.listAll.mockResolvedValue(txs as never);

      const result = await controller.listAll();

      expect(service.listAll).toHaveBeenCalledWith({
        status: undefined,
        gateway: undefined,
        type: undefined,
        limit: undefined,
        offset: undefined,
      });
      expect(result).toBe(txs);
    });

    it('parses limit and offset as integers', async () => {
      service.listAll.mockResolvedValue([] as never);

      await controller.listAll(undefined, undefined, undefined, '10', '20');

      expect(service.listAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 10, offset: 20 }));
    });

    it('passes status, gateway, type filters through', async () => {
      service.listAll.mockResolvedValue([] as never);

      await controller.listAll('paid', 'xendit', 'subscription_new');

      expect(service.listAll).toHaveBeenCalledWith(expect.objectContaining({
        status: 'paid',
        gateway: 'xendit',
        type: 'subscription_new',
      }));
    });
  });
});
