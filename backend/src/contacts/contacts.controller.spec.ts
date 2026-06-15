import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateContactDto } from './dto/create-contact.dto';
import type { UpdateContactDto } from './dto/update-contact.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<ContactsService> {
  return {
    listMine: jest.fn(),
    recents: jest.fn(),
    create: jest.fn(),
    touch: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<ContactsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: ContactsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [ContactsController],
    providers: [{ provide: ContactsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<ContactsController>(ContactsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: jest.Mocked<ContactsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('list', () => {
    it('calls listMine with default sort "recent" when no sort param provided', async () => {
      service.listMine.mockResolvedValue([] as never);
      await controller.list(mockUser);
      expect(service.listMine).toHaveBeenCalledWith('user-1', { sort: 'recent', limit: undefined });
    });

    it('uses "name" sort when valid sort param is passed', async () => {
      service.listMine.mockResolvedValue([] as never);
      await controller.list(mockUser, 'name');
      expect(service.listMine).toHaveBeenCalledWith('user-1', { sort: 'name', limit: undefined });
    });

    it('falls back to "recent" for unknown sort values', async () => {
      service.listMine.mockResolvedValue([] as never);
      await controller.list(mockUser, 'bogus');
      expect(service.listMine).toHaveBeenCalledWith('user-1', { sort: 'recent', limit: undefined });
    });

    it('parses limit as integer', async () => {
      service.listMine.mockResolvedValue([] as never);
      await controller.list(mockUser, 'frequent', '20');
      expect(service.listMine).toHaveBeenCalledWith('user-1', { sort: 'frequent', limit: 20 });
    });

    it('throws BadRequestException for non-positive limit', () => {
      expect(() => controller.list(mockUser, undefined, '0')).toThrow(BadRequestException);
    });

    it('throws BadRequestException for non-numeric limit', () => {
      expect(() => controller.list(mockUser, undefined, 'abc')).toThrow(BadRequestException);
    });
  });

  describe('recents', () => {
    it('delegates to service.recents with user id', async () => {
      const recents = [{ id: 'c-1' }];
      service.recents.mockResolvedValue(recents as never);

      const result = await controller.recents(mockUser);

      expect(service.recents).toHaveBeenCalledWith('user-1');
      expect(result).toBe(recents);
    });
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto: CreateContactDto = { name: 'Alice', phone: '0812345' } as never;
      const contact = { id: 'c-1' };
      service.create.mockResolvedValue(contact as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(contact);
    });
  });

  describe('touch', () => {
    it('touches by phone when phone provided', async () => {
      service.touch.mockResolvedValue({ id: 'c-1' } as never);

      const result = await controller.touch({ phone: '0812' }, mockUser);

      expect(service.touch).toHaveBeenCalledWith('user-1', '0812');
      expect(result).toEqual({ id: 'c-1' });
    });

    it('touches by contact_id when contact_id provided', async () => {
      service.touch.mockResolvedValue({ id: 'c-1' } as never);

      const result = await controller.touch({ contact_id: 'c-1' }, mockUser);

      expect(service.touch).toHaveBeenCalledWith('user-1', 'c-1');
    });

    it('throws BadRequestException when neither phone nor contact_id provided', () => {
      expect(() => controller.touch({}, mockUser)).toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('delegates to service.update with id, dto, and user id', async () => {
      const dto: UpdateContactDto = { name: 'Bob' };
      service.update.mockResolvedValue({ id: 'c-1', name: 'Bob' } as never);

      const result = await controller.update('c-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('c-1', dto, 'user-1');
      expect(result).toEqual({ id: 'c-1', name: 'Bob' });
    });
  });

  describe('remove', () => {
    it('delegates to service.delete with id and user id', async () => {
      service.delete.mockResolvedValue({ message: 'deleted' } as never);

      const result = await controller.remove('c-1', mockUser);

      expect(service.delete).toHaveBeenCalledWith('c-1', 'user-1');
      expect(result).toEqual({ message: 'deleted' });
    });
  });
});
