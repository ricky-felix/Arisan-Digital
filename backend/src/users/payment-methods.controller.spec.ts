import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import type { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<PaymentMethodsService> {
  return {
    listOwn: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listForPeer: jest.fn(),
  } as unknown as jest.Mocked<PaymentMethodsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: PaymentMethodsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [PaymentMethodsController],
    providers: [{ provide: PaymentMethodsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<PaymentMethodsController>(PaymentMethodsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('PaymentMethodsController', () => {
  let controller: PaymentMethodsController;
  let service: jest.Mocked<PaymentMethodsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('listOwn', () => {
    it('delegates to service.listOwn with user id', async () => {
      const methods = [{ id: 'pm-1', type: 'gopay' }];
      service.listOwn.mockResolvedValue(methods as never);

      const result = await controller.listOwn(mockUser);

      expect(service.listOwn).toHaveBeenCalledWith('user-1');
      expect(result).toBe(methods);
    });
  });

  describe('create', () => {
    it('delegates to service.create with user id and dto', async () => {
      const dto: CreatePaymentMethodDto = { type: 'gopay', label: 'My GoPay', phone: '0812345' } as never;
      const method = { id: 'pm-1', type: 'gopay' };
      service.create.mockResolvedValue(method as never);

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(method);
    });
  });

  describe('update', () => {
    it('delegates to service.update with user id, method id, and dto', async () => {
      const dto: UpdatePaymentMethodDto = { label: 'Updated Label' } as never;
      const updated = { id: 'pm-1', label: 'Updated Label' };
      service.update.mockResolvedValue(updated as never);

      const result = await controller.update(mockUser, 'pm-1', dto);

      expect(service.update).toHaveBeenCalledWith('user-1', 'pm-1', dto);
      expect(result).toBe(updated);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with user id and method id', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete(mockUser, 'pm-1');

      expect(service.delete).toHaveBeenCalledWith('user-1', 'pm-1');
    });
  });

  describe('listForPeer', () => {
    it('delegates to service.listForPeer with targetUserId and requesterId', async () => {
      const masked = [{ id: 'pm-1', phone: '••••5678' }];
      service.listForPeer.mockResolvedValue(masked as never);

      const result = await controller.listForPeer(mockUser, 'user-2');

      expect(service.listForPeer).toHaveBeenCalledWith('user-2', 'user-1');
      expect(result).toBe(masked);
    });
  });
});
