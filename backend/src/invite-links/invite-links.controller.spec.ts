import { Test, TestingModule } from '@nestjs/testing';
import { InviteLinksController } from './invite-links.controller';
import { InviteLinksService } from './invite-links.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateInviteDto } from './dto/create-invite.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<InviteLinksService> {
  return {
    create: jest.fn(),
    listForGroup: jest.fn(),
    revoke: jest.fn(),
    redeem: jest.fn(),
  } as unknown as jest.Mocked<InviteLinksService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: InviteLinksService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [InviteLinksController],
    providers: [{ provide: InviteLinksService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<InviteLinksController>(InviteLinksController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('InviteLinksController', () => {
  let controller: InviteLinksController;
  let service: jest.Mocked<InviteLinksService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto: CreateInviteDto = { group_id: 'g-1' } as never;
      const invite = { id: 'inv-1', token: 'abc123' };
      service.create.mockResolvedValue(invite as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(invite);
    });
  });

  describe('listForGroup', () => {
    it('delegates to service.listForGroup with groupId and user id', async () => {
      const invites = [{ id: 'inv-1' }];
      service.listForGroup.mockResolvedValue(invites as never);

      const result = await controller.listForGroup('g-1', mockUser);

      expect(service.listForGroup).toHaveBeenCalledWith('g-1', 'user-1');
      expect(result).toBe(invites);
    });
  });

  describe('revoke', () => {
    it('delegates to service.revoke with id and user id', async () => {
      const revoked = { id: 'inv-1', is_revoked: true };
      service.revoke.mockResolvedValue(revoked as never);

      const result = await controller.revoke('inv-1', mockUser);

      expect(service.revoke).toHaveBeenCalledWith('inv-1', 'user-1');
      expect(result).toBe(revoked);
    });
  });

  describe('redeem', () => {
    it('delegates to service.redeem with token and user id', async () => {
      const membership = { id: 'mem-1' };
      service.redeem.mockResolvedValue(membership as never);

      const result = await controller.redeem('tok-abc', mockUser);

      expect(service.redeem).toHaveBeenCalledWith('tok-abc', 'user-1');
      expect(result).toBe(membership);
    });
  });
});
