import { Test, TestingModule } from '@nestjs/testing';
import { BillCommentsController } from './bill-comments.controller';
import { BillCommentsService } from './bill-comments.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthUser } from '../common/types/schema.types';
import type { CreateCommentDto } from './dto/create-comment.dto';
import type { UpdateCommentDto } from './dto/update-comment.dto';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeMockService(): jest.Mocked<BillCommentsService> {
  return {
    listForBill: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  } as unknown as jest.Mocked<BillCommentsService>;
}

const mockUser: AuthUser = { id: 'user-1', email: 'a@b.com', platform_role: 'user' };

async function buildModule(service: BillCommentsService) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [BillCommentsController],
    providers: [{ provide: BillCommentsService, useValue: service }],
  })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return module.get<BillCommentsController>(BillCommentsController);
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('BillCommentsController', () => {
  let controller: BillCommentsController;
  let service: jest.Mocked<BillCommentsService>;

  beforeEach(async () => {
    service = makeMockService();
    controller = await buildModule(service);
  });

  describe('listForBill', () => {
    it('delegates to service.listForBill with billId and user id', async () => {
      const comments = [{ id: 'c-1', text: 'Nice' }];
      service.listForBill.mockResolvedValue(comments as never);

      const result = await controller.listForBill('bill-1', mockUser);

      expect(service.listForBill).toHaveBeenCalledWith('bill-1', 'user-1');
      expect(result).toBe(comments);
    });
  });

  describe('create', () => {
    it('delegates to service.create with dto and user id', async () => {
      const dto: CreateCommentDto = { bill_id: 'bill-1', content: 'Hello' } as never;
      const comment = { id: 'c-1', content: 'Hello' };
      service.create.mockResolvedValue(comment as never);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(comment);
    });
  });

  describe('update', () => {
    it('delegates to service.update with id, dto, and user id', async () => {
      const dto: UpdateCommentDto = { content: 'Updated' } as never;
      const updated = { id: 'c-1', content: 'Updated' };
      service.update.mockResolvedValue(updated as never);

      const result = await controller.update('c-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('c-1', dto, 'user-1');
      expect(result).toBe(updated);
    });
  });

  describe('softDelete', () => {
    it('delegates to service.softDelete with id and user id', async () => {
      const deleted = { id: 'c-1', deleted_at: '2026-01-01T00:00:00Z' };
      service.softDelete.mockResolvedValue(deleted as never);

      const result = await controller.softDelete('c-1', mockUser);

      expect(service.softDelete).toHaveBeenCalledWith('c-1', 'user-1');
      expect(result).toBe(deleted);
    });
  });
});
