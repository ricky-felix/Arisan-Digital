import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembersController } from './group-members.controller';
import { GroupMembersService } from './group-members.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { AddMemberDto } from './dto/add-member.dto';
import type { AssignGiliranDto } from './dto/assign-giliran.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<GroupMembersService> {
  return {
    listForGroup: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    assignGiliranOrder: jest.fn(),
    randomShuffle: jest.fn(),
  } as unknown as jest.Mocked<GroupMembersService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: GroupMembersService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [GroupMembersController],
    providers: [{ provide: GroupMembersService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<GroupMembersController>(GroupMembersController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('GroupMembersController', () => {
  let controller: GroupMembersController;
  let service: jest.Mocked<GroupMembersService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('list', () => {
    it('delegates to service.listForGroup with groupId', async () => {
      const members = [{ id: 'm-1' }, { id: 'm-2' }];
      service.listForGroup.mockResolvedValue(members as never);

      const result = await controller.list('g-1');

      expect(service.listForGroup).toHaveBeenCalledWith('g-1');
      expect(result).toBe(members);
    });
  });

  describe('addMember', () => {
    it('delegates to service.addMember with groupId, dto, and user id', async () => {
      const dto: AddMemberDto = { user_id: 'user-2' } as never;
      const member = { id: 'm-1', user_id: 'user-2' };
      service.addMember.mockResolvedValue(member as never);

      const result = await controller.addMember('g-1', dto, mockUser);

      expect(service.addMember).toHaveBeenCalledWith('g-1', dto, 'user-1');
      expect(result).toBe(member);
    });
  });

  describe('removeMember', () => {
    it('delegates to service.removeMember with groupId, userId, and requester id', async () => {
      service.removeMember.mockResolvedValue({ message: 'removed' } as never);

      const result = await controller.removeMember('g-1', 'user-2', mockUser);

      expect(service.removeMember).toHaveBeenCalledWith('g-1', 'user-2', 'user-1');
      expect(result).toEqual({ message: 'removed' });
    });
  });

  describe('assignGiliran', () => {
    it('delegates to service.assignGiliranOrder with groupId, dto, and user id', async () => {
      const dto: AssignGiliranDto = { ordered_user_ids: ['user-1', 'user-2'] } as never;
      const result_data = { group_id: 'g-1', order: ['user-1', 'user-2'] };
      service.assignGiliranOrder.mockResolvedValue(result_data as never);

      const result = await controller.assignGiliran('g-1', dto, mockUser);

      expect(service.assignGiliranOrder).toHaveBeenCalledWith('g-1', dto, 'user-1');
      expect(result).toBe(result_data);
    });
  });

  describe('randomShuffle', () => {
    it('delegates to service.randomShuffle with groupId and user id', async () => {
      const shuffled = { group_id: 'g-1', order: ['user-2', 'user-1'] };
      service.randomShuffle.mockResolvedValue(shuffled as never);

      const result = await controller.randomShuffle('g-1', mockUser);

      expect(service.randomShuffle).toHaveBeenCalledWith('g-1', 'user-1');
      expect(result).toBe(shuffled);
    });
  });
});
