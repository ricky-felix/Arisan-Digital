import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateGroupDto } from './dto/create-group.dto';
import type { UpdateGroupDto } from './dto/update-group.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<GroupsService> {
  return {
    findAllForUser: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<GroupsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: GroupsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [GroupsController],
    providers: [{ provide: GroupsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<GroupsController>(GroupsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: jest.Mocked<GroupsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('findAll', () => {
    it('delegates to service.findAllForUser with user id', async () => {
      const groups = [{ id: 'g-1' }, { id: 'g-2' }];
      service.findAllForUser.mockResolvedValue(groups as never);

      const result = await controller.findAll(mockUser);

      expect(service.findAllForUser).toHaveBeenCalledWith('user-1');
      expect(result).toBe(groups);
    });
  });

  describe('findOne', () => {
    it('delegates to service.findOne with id', async () => {
      const group = { id: 'g-1' };
      service.findOne.mockResolvedValue(group as never);

      const result = await controller.findOne('g-1');

      expect(service.findOne).toHaveBeenCalledWith('g-1');
      expect(result).toBe(group);
    });
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto: CreateGroupDto = { name: 'My Group', member_ids: [] } as never;
      const group = { id: 'g-1', name: 'My Group' };
      service.create.mockResolvedValue(group as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(group);
    });
  });

  describe('update', () => {
    it('delegates to service.update with id, dto, and user id', async () => {
      const dto: UpdateGroupDto = { name: 'Renamed' };
      const updated = { id: 'g-1', name: 'Renamed' };
      service.update.mockResolvedValue(updated as never);

      const result = await controller.update('g-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('g-1', dto, 'user-1');
      expect(result).toBe(updated);
    });
  });

  describe('remove', () => {
    it('delegates to service.remove with id and user id', async () => {
      service.remove.mockResolvedValue({ message: 'deleted' } as never);

      const result = await controller.remove('g-1', mockUser);

      expect(service.remove).toHaveBeenCalledWith('g-1', 'user-1');
      expect(result).toEqual({ message: 'deleted' });
    });
  });
});
