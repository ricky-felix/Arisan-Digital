import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { CreateCommentDto } from './dto/create-comment.dto';
import type { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class BillCommentsService {
  constructor(private readonly supabase: SupabaseService) {}

  // ─────────────────────────────────────────────────────────────────
  // LIST (threaded, exclude soft-deleted)
  // ─────────────────────────────────────────────────────────────────

  async listForBill(billId: string, userId: string) {
    await this.requireBillAccess(billId, userId);

    const { data, error } = await this.supabase.admin
      .from('bill_comments')
      .select('*')
      .eq('bill_id', billId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw new BadRequestException(error.message);

    // Build threaded structure: top-level comments contain nested replies
    return this.buildThreaded(data ?? []);
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────

  async create(dto: CreateCommentDto, userId: string) {
    await this.requireBillAccess(dto.bill_id, userId);

    if (dto.parent_id) {
      // Validate parent exists and belongs to the same bill
      const { data: parent } = await this.supabase.admin
        .from('bill_comments')
        .select('id, bill_id, deleted_at')
        .eq('id', dto.parent_id)
        .maybeSingle();

      if (!parent || parent.bill_id !== dto.bill_id) {
        throw new NotFoundException(`Parent comment ${dto.parent_id} not found in bill ${dto.bill_id}`);
      }
      if (parent.deleted_at) {
        throw new BadRequestException('Cannot reply to a deleted comment');
      }
    }

    const { data, error } = await this.supabase.admin
      .from('bill_comments')
      .insert({
        bill_id: dto.bill_id,
        user_id: userId,
        body: dto.body,
        parent_id: dto.parent_id ?? null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.requireComment(id);

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (comment.deleted_at) {
      throw new BadRequestException('Cannot edit a deleted comment');
    }

    const { data, error } = await this.supabase.admin
      .from('bill_comments')
      .update({ body: dto.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // SOFT DELETE
  // ─────────────────────────────────────────────────────────────────

  async softDelete(id: string, userId: string) {
    const comment = await this.requireComment(id);

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (comment.deleted_at) {
      throw new BadRequestException('Comment is already deleted');
    }

    const { data, error } = await this.supabase.admin
      .from('bill_comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private async requireBillAccess(billId: string, userId: string): Promise<void> {
    const { data: bill } = await this.supabase.admin
      .from('bills')
      .select('paid_by')
      .eq('id', billId)
      .maybeSingle();

    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);
    if (bill.paid_by === userId) return;

    const { data: participant } = await this.supabase.admin
      .from('bill_participants')
      .select('id')
      .eq('bill_id', billId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this bill');
    }
  }

  private async requireComment(id: string) {
    const { data } = await this.supabase.admin
      .from('bill_comments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!data) throw new NotFoundException(`Comment ${id} not found`);
    return data;
  }

  private buildThreaded(
    rows: Array<Record<string, unknown>>,
  ): Array<Record<string, unknown>> {
    const map = new Map<string, Record<string, unknown>>();
    const roots: Array<Record<string, unknown>> = [];

    for (const row of rows) {
      map.set(row.id as string, { ...row, replies: [] });
    }

    for (const row of rows) {
      const node = map.get(row.id as string)!;
      if (row.parent_id) {
        const parent = map.get(row.parent_id as string);
        if (parent) {
          (parent.replies as Array<Record<string, unknown>>).push(node);
        } else {
          // Orphaned reply (parent was soft-deleted but reply is not) — include at root
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
