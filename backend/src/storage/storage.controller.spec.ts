import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import type { CreateReadUrlDto } from './dto/create-read-url.dto';
import type { DeleteObjectDto } from './dto/delete-object.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<StorageService> {
  return {
    createUploadUrl: jest.fn(),
    createReadUrl: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;
}

const regularUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };
const superAdmin: AuthUser = { id: 'admin-1', email: 'admin@b.com', platform_role: 'super_admin' };

async function buildModule(service: StorageService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [StorageController],
    providers: [{ provide: StorageService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<StorageController>(StorageController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('StorageController', () => {
  let controller: StorageController;
  let service: jest.Mocked<StorageService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('createUploadUrl', () => {
    it('delegates to service.createUploadUrl with dto and user id', async () => {
      const dto: CreateUploadUrlDto = { bucket: 'avatars', path: 'user-1/avatar.jpg' } as never;
      const response = { bucket: 'avatars', path: 'user-1/avatar.jpg', signed_url: 'https://...', token: 'tok' };
      service.createUploadUrl.mockResolvedValue(response as never);

      const result = await controller.createUploadUrl(dto, regularUser);

      expect(service.createUploadUrl).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(response);
    });
  });

  describe('createReadUrl', () => {
    it('passes isSuperAdmin=false for regular users', async () => {
      const dto: CreateReadUrlDto = { bucket: 'avatars', path: 'user-1/avatar.jpg' } as never;
      service.createReadUrl.mockResolvedValue({ signed_url: 'https://...', expires_at: '...' } as never);

      await controller.createReadUrl(dto, regularUser);

      expect(service.createReadUrl).toHaveBeenCalledWith(dto, 'user-1', false);
    });

    it('passes isSuperAdmin=true for super_admin users', async () => {
      const dto: CreateReadUrlDto = { bucket: 'avatars', path: 'user-other/doc.jpg' } as never;
      service.createReadUrl.mockResolvedValue({ signed_url: 'https://...', expires_at: '...' } as never);

      await controller.createReadUrl(dto, superAdmin);

      expect(service.createReadUrl).toHaveBeenCalledWith(dto, 'admin-1', true);
    });
  });

  describe('deleteObject', () => {
    it('passes isSuperAdmin=false for regular users', async () => {
      const dto: DeleteObjectDto = { bucket: 'avatars', path: 'user-1/old.jpg' } as never;
      service.delete.mockResolvedValue({ message: 'deleted' } as never);

      await controller.deleteObject(dto, regularUser);

      expect(service.delete).toHaveBeenCalledWith('avatars', 'user-1/old.jpg', 'user-1', false);
    });

    it('passes isSuperAdmin=true for super_admin users', async () => {
      const dto: DeleteObjectDto = { bucket: 'avatars', path: 'user-other/file.jpg' } as never;
      service.delete.mockResolvedValue({ message: 'deleted' } as never);

      await controller.deleteObject(dto, superAdmin);

      expect(service.delete).toHaveBeenCalledWith('avatars', 'user-other/file.jpg', 'admin-1', true);
    });
  });
});
