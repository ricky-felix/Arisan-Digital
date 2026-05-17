import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { getStrategy } from '../bills/strategies/split-strategy.factory';
import type { BillParticipantInput } from '../bills/strategies/split-strategy.interface';
import type { AddParticipantDto } from './dto/add-participant.dto';
import type { SplitMethod } from '../common/types/schema.types';

@Injectable()
export class BillParticipantsService {
  constructor(private readonly supabase: SupabaseService) {}

  async addParticipant(billId: string, dto: AddParticipantDto, userId: string) {
    const bill = await this.requireBillAsPayer(billId, userId);

    // Check not already a participant
    const { data: existing } = await this.supabase.admin
      .from('bill_participants')
      .select('id')
      .eq('bill_id', billId)
      .eq('user_id', dto.user_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(
        `User ${dto.user_id} is already a participant of bill ${billId}`,
      );
    }

    const { error: insertError } = await this.supabase.admin
      .from('bill_participants')
      .insert({
        bill_id: billId,
        user_id: dto.user_id,
        shares: dto.shares ?? 1,
        percentage: dto.percentage ?? null,
      });

    if (insertError) throw new BadRequestException(insertError.message);

    await this.recomputeSplits(billId, bill.total_amount, bill.split_method as SplitMethod, bill.paid_by as string);

    return this.listForBill(billId);
  }

  async removeParticipant(billId: string, participantUserId: string, userId: string) {
    const bill = await this.requireBillAsPayer(billId, userId);

    if (participantUserId === bill.paid_by) {
      throw new BadRequestException('Cannot remove the bill payer from participants');
    }

    const { error } = await this.supabase.admin
      .from('bill_participants')
      .delete()
      .eq('bill_id', billId)
      .eq('user_id', participantUserId);

    if (error) throw new BadRequestException(error.message);

    await this.recomputeSplits(billId, bill.total_amount, bill.split_method as SplitMethod, bill.paid_by as string);

    return this.listForBill(billId);
  }

  async listForBill(billId: string) {
    const { data, error } = await this.supabase.admin
      .from('bill_participants')
      .select('*')
      .eq('bill_id', billId);

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────

  private async requireBillAsPayer(billId: string, userId: string) {
    const { data: bill } = await this.supabase.admin
      .from('bills')
      .select('id, paid_by, total_amount, split_method')
      .eq('id', billId)
      .maybeSingle();

    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);
    if (bill.paid_by !== userId) {
      throw new ForbiddenException('Only the bill payer can modify participants');
    }
    return bill;
  }

  private async recomputeSplits(
    billId: string,
    totalAmount: number,
    splitMethod: SplitMethod,
    payerId: string,
  ): Promise<void> {
    const { data: participants } = await this.supabase.admin
      .from('bill_participants')
      .select('id, user_id, shares, percentage')
      .eq('bill_id', billId);

    if (!participants || participants.length === 0) return;

    await this.supabase.admin
      .from('bill_splits')
      .delete()
      .eq('bill_id', billId);

    const inputs: BillParticipantInput[] = (
      participants as Array<{ user_id: string; shares: number; percentage: number | null }>
    ).map((p) => ({
      user_id: p.user_id,
      shares: p.shares,
      percentage: p.percentage ?? undefined,
    }));

    const strategy = getStrategy(splitMethod);
    const results = strategy.compute(totalAmount, inputs, payerId);

    const participantIdMap = new Map<string, string>(
      (participants as Array<{ id: string; user_id: string }>).map((p) => [p.user_id, p.id]),
    );

    const splitRows = results.map((r) => ({
      bill_id: billId,
      participant_id: participantIdMap.get(r.user_id) ?? '',
      user_id: r.user_id,
      amount_owed: r.amount_owed,
      is_payer: r.is_payer,
    }));

    const { error } = await this.supabase.admin
      .from('bill_splits')
      .insert(splitRows);

    if (error) throw new BadRequestException(error.message);
  }
}
