import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { SetPinDto } from './dto/set-pin.dto';
import type { VerifyPinDto } from './dto/verify-pin.dto';
import type { UpdateSecurityDto } from './dto/update-security.dto';
import type { UpsertBankAccountDto } from './dto/upsert-bank-account.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<UsersService> {
  return {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    listAll: jest.fn(),
    setPin: jest.fn(),
    verifyPin: jest.fn(),
    getSecurity: jest.fn(),
    updateSecurity: jest.fn(),
    getBankAccount: jest.fn(),
    upsertBankAccount: jest.fn(),
    deleteBankAccount: jest.fn(),
    ensureProfile: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: UsersService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [UsersController],
    providers: [{ provide: UsersService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<UsersController>(UsersController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('getProfile', () => {
    it('delegates to service.getProfile with user id', async () => {
      const profile = { id: 'user-1', name: 'Alice' };
      service.getProfile.mockResolvedValue(profile as never);

      const result = await controller.getProfile(mockUser);

      expect(service.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toBe(profile);
    });
  });

  describe('updateProfile', () => {
    it('delegates to service.updateProfile with user id and dto', async () => {
      const dto: UpdateUserDto = { name: 'Alice Updated' };
      const updated = { id: 'user-1', name: 'Alice Updated' };
      service.updateProfile.mockResolvedValue(updated as never);

      const result = await controller.updateProfile(mockUser, dto);

      expect(service.updateProfile).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(updated);
    });
  });

  describe('listAll', () => {
    it('delegates to service.listAll', async () => {
      const users = [{ id: 'user-1' }, { id: 'user-2' }];
      service.listAll.mockResolvedValue(users as never);

      const result = await controller.listAll();

      expect(service.listAll).toHaveBeenCalledWith();
      expect(result).toBe(users);
    });
  });

  describe('setPin', () => {
    it('delegates to service.setPin with user id and dto', async () => {
      const dto: SetPinDto = { pin: '123456' };
      service.setPin.mockResolvedValue({ success: true });

      const result = await controller.setPin(mockUser, dto);

      expect(service.setPin).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ success: true });
    });
  });

  describe('verifyPin', () => {
    it('delegates to service.verifyPin with user id and dto', async () => {
      const dto: VerifyPinDto = { pin: '123456' };
      service.verifyPin.mockResolvedValue({ valid: true });

      const result = await controller.verifyPin(mockUser, dto);

      expect(service.verifyPin).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('getSecurity', () => {
    it('delegates to service.getSecurity with user id', async () => {
      const security = { has_pin: true, app_lock_enabled: false };
      service.getSecurity.mockResolvedValue(security as never);

      const result = await controller.getSecurity(mockUser);

      expect(service.getSecurity).toHaveBeenCalledWith('user-1');
      expect(result).toBe(security);
    });
  });

  describe('updateSecurity', () => {
    it('delegates to service.updateSecurity with user id and dto', async () => {
      const dto: UpdateSecurityDto = { app_lock_enabled: true };
      const updated = { has_pin: true, app_lock_enabled: true };
      service.updateSecurity.mockResolvedValue(updated as never);

      const result = await controller.updateSecurity(mockUser, dto);

      expect(service.updateSecurity).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(updated);
    });
  });

  describe('getBankAccount', () => {
    it('delegates to service.getBankAccount with user id', async () => {
      const account = { bank_name: 'BCA', account_number: '1234' };
      service.getBankAccount.mockResolvedValue(account as never);

      const result = await controller.getBankAccount(mockUser);

      expect(service.getBankAccount).toHaveBeenCalledWith('user-1');
      expect(result).toBe(account);
    });
  });

  describe('upsertBankAccount', () => {
    it('delegates to service.upsertBankAccount with user id and dto', async () => {
      const dto: UpsertBankAccountDto = { bank_name: 'BCA', account_number: '1234', holder_name: 'Alice' } as never;
      const saved = { bank_name: 'BCA' };
      service.upsertBankAccount.mockResolvedValue(saved as never);

      const result = await controller.upsertBankAccount(mockUser, dto);

      expect(service.upsertBankAccount).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(saved);
    });
  });

  describe('deleteBankAccount', () => {
    it('delegates to service.deleteBankAccount with user id', async () => {
      service.deleteBankAccount.mockResolvedValue({ success: true } as never);

      const result = await controller.deleteBankAccount(mockUser);

      expect(service.deleteBankAccount).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ success: true });
    });
  });
});
