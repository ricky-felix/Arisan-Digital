import { Test, TestingModule } from '@nestjs/testing';
import { BillParticipantsController } from './bill-participants.controller';
import { BillParticipantsService } from './bill-participants.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { AddParticipantDto } from './dto/add-participant.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<BillParticipantsService> {
  return {
    addParticipant: jest.fn(),
    removeParticipant: jest.fn(),
  } as unknown as jest.Mocked<BillParticipantsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: BillParticipantsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [BillParticipantsController],
    providers: [{ provide: BillParticipantsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<BillParticipantsController>(BillParticipantsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('BillParticipantsController', () => {
  let controller: BillParticipantsController;
  let service: jest.Mocked<BillParticipantsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('addParticipant', () => {
    it('delegates to service.addParticipant with billId, dto, and user id', async () => {
      const dto: AddParticipantDto = { user_id: 'user-2' } as never;
      const participant = { id: 'bp-1', user_id: 'user-2' };
      service.addParticipant.mockResolvedValue(participant as never);

      const result = await controller.addParticipant('bill-1', dto, mockUser);

      expect(service.addParticipant).toHaveBeenCalledWith('bill-1', dto, 'user-1');
      expect(result).toBe(participant);
    });
  });

  describe('removeParticipant', () => {
    it('delegates to service.removeParticipant with billId, participantUserId, and user id', async () => {
      service.removeParticipant.mockResolvedValue({ message: 'removed' } as never);

      const result = await controller.removeParticipant('bill-1', 'user-2', mockUser);

      expect(service.removeParticipant).toHaveBeenCalledWith('bill-1', 'user-2', 'user-1');
      expect(result).toEqual({ message: 'removed' });
    });
  });
});
