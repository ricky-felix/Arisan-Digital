import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getStrategy } from './strategies/split-strategy.factory';
import type { BillParticipantInput } from './strategies/split-strategy.interface';
import type { CreateBillDto } from './dto/create-bill.dto';
import type { UpdateBillDto } from './dto/update-bill.dto';
import type { SplitMethod } from '../common/types/schema.types';

@Injectable()
export class BillsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────

  async create(dto: CreateBillDto, userId: string) {
    // 1. Insert bill row
    const { data: bill, error: billError } = await this.supabase.admin
      .from('bills')
      .insert({
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        total_amount: dto.total_amount,
        split_method: dto.split_method,
        receipt_url: dto.receipt_url ?? null,
        group_id: dto.group_id ?? null,
        paid_by: userId,
      })
      .select()
      .single();

    if (billError) throw new BadRequestException(billError.message);

    // 2. Ensure payer is included in the participants list
    const participants = this.ensurePayerInParticipants(dto.participants, userId);

    // 3. Insert bill_participants rows
    const participantRows = participants.map((p) => ({
      bill_id: bill.id,
      user_id: p.user_id,
      shares: p.shares ?? 1,
      percentage: p.percentage ?? null,
    }));

    const { data: insertedParticipants, error: pError } = await this.supabase.admin
      .from('bill_participants')
      .insert(participantRows)
      .select();

    if (pError) throw new BadRequestException(pError.message);

    // 4. Compute splits and insert bill_splits
    await this.computeAndInsertSplits(
      bill.id,
      bill.total_amount,
      bill.split_method as SplitMethod,
      participants,
      userId,
      insertedParticipants as Array<{ id: string; user_id: string }>,
    );

    // 5. Notify all non-payer participants
    const nonPayers = participants.filter((p) => p.user_id !== userId);
    await this.notifications.createMany(
      nonPayers.map((p) => ({
        user_id: p.user_id,
        type: 'bill_created' as const,
        title: 'Tagihan baru',
        body: `Kamu ditambahkan ke tagihan "${bill.title as string}"`,
        metadata: { bill_id: bill.id as string },
      })),
    );

    return this.findOne(bill.id, userId);
  }

  // ─────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────

  async findOne(id: string, userId: string) {
    const { data: bill, error } = await this.supabase.admin
      .from('bills')
      .select('*, bill_participants(*), bill_splits(*)')
      .eq('id', id)
      .single();

    if (error || !bill) throw new NotFoundException(`Bill ${id} not found`);

    // RLS-equivalent visibility check: paid_by or participant
    const isVisible =
      bill.paid_by === userId ||
      (bill.bill_participants as Array<{ user_id: string }>).some(
        (p) => p.user_id === userId,
      );

    if (!isVisible) {
      throw new ForbiddenException('You do not have access to this bill');
    }

    return bill;
  }

  async listMine(userId: string) {
    // Bills where I am the payer
    const { data: asPayer, error: e1 } = await this.supabase.admin
      .from('bills')
      .select('*, bill_participants(*), bill_splits(*)')
      .eq('paid_by', userId);

    if (e1) throw new BadRequestException(e1.message);

    // Bills where I am a participant but not the payer
    const { data: asParticipant, error: e2 } = await this.supabase.admin
      .from('bill_participants')
      .select('bill_id')
      .eq('user_id', userId);

    if (e2) throw new BadRequestException(e2.message);

    const participantBillIds = (asParticipant ?? [])
      .map((row: { bill_id: string }) => row.bill_id)
      .filter((id) => !(asPayer ?? []).some((b: { id: string }) => b.id === id));

    let asParticipantBills: unknown[] = [];
    if (participantBillIds.length > 0) {
      const { data, error: e3 } = await this.supabase.admin
        .from('bills')
        .select('*, bill_participants(*), bill_splits(*)')
        .in('id', participantBillIds);

      if (e3) throw new BadRequestException(e3.message);
      asParticipantBills = data ?? [];
    }

    return [...(asPayer ?? []), ...asParticipantBills];
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateBillDto, userId: string) {
    const bill = await this.findOne(id, userId);

    if (bill.paid_by !== userId) {
      throw new ForbiddenException('Only the bill payer can update it');
    }

    const needsRecompute =
      dto.total_amount !== undefined ||
      dto.split_method !== undefined ||
      dto.participants !== undefined;

    // Build the patch object for editable scalar fields
    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.receipt_url !== undefined) patch.receipt_url = dto.receipt_url;
    if (dto.total_amount !== undefined) patch.total_amount = dto.total_amount;
    if (dto.split_method !== undefined) patch.split_method = dto.split_method;

    if (Object.keys(patch).length > 0) {
      const { error } = await this.supabase.admin
        .from('bills')
        .update(patch)
        .eq('id', id);

      if (error) throw new BadRequestException(error.message);
    }

    if (needsRecompute) {
      const effectiveTotal = dto.total_amount ?? bill.total_amount;
      const effectiveMethod = (dto.split_method ?? bill.split_method) as SplitMethod;
      const effectiveParticipants: BillParticipantInput[] = dto.participants
        ? this.ensurePayerInParticipants(dto.participants, userId)
        : (bill.bill_participants as BillParticipantInput[]);

      // Replace participants if a new list was provided
      if (dto.participants !== undefined) {
        await this.supabase.admin
          .from('bill_participants')
          .delete()
          .eq('bill_id', id);

        const rows = effectiveParticipants.map((p) => ({
          bill_id: id,
          user_id: p.user_id,
          shares: p.shares ?? 1,
          percentage: p.percentage ?? null,
        }));

        const { data: inserted, error: pErr } = await this.supabase.admin
          .from('bill_participants')
          .insert(rows)
          .select();

        if (pErr) throw new BadRequestException(pErr.message);

        // Delete old splits then recompute
        await this.supabase.admin
          .from('bill_splits')
          .delete()
          .eq('bill_id', id);

        await this.computeAndInsertSplits(
          id,
          effectiveTotal,
          effectiveMethod,
          effectiveParticipants,
          userId,
          inserted as Array<{ id: string; user_id: string }>,
        );
      } else {
        // Only total/method changed — recompute splits from existing participants
        const { data: existingParticipants } = await this.supabase.admin
          .from('bill_participants')
          .select('id, user_id, shares, percentage')
          .eq('bill_id', id);

        await this.supabase.admin
          .from('bill_splits')
          .delete()
          .eq('bill_id', id);

        const mapped: BillParticipantInput[] = (
          existingParticipants as Array<{
            user_id: string;
            shares: number;
            percentage: number | null;
          }>
        ).map((ep) => ({
          user_id: ep.user_id,
          shares: ep.shares,
          percentage: ep.percentage ?? undefined,
        }));

        await this.computeAndInsertSplits(
          id,
          effectiveTotal,
          effectiveMethod,
          mapped,
          userId,
          existingParticipants as Array<{ id: string; user_id: string }>,
        );
      }
    }

    return this.findOne(id, userId);
  }

  // ─────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────

  async delete(id: string, userId: string) {
    const bill = await this.findOne(id, userId);

    if (bill.paid_by !== userId) {
      throw new ForbiddenException('Only the bill payer can delete it');
    }

    // Guard: cannot delete if any settlement exists (even pending)
    const { count } = await this.supabase.admin
      .from('bill_settlements')
      .select('id', { count: 'exact', head: true })
      .eq('bill_id', id);

    if ((count ?? 0) > 0) {
      throw new BadRequestException(
        'Cannot delete a bill that already has settlement records',
      );
    }

    const { error } = await this.supabase.admin
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Bill deleted' };
  }

  // ─────────────────────────────────────────────────────────────────
  // MARK SETTLED
  // ─────────────────────────────────────────────────────────────────

  async markSettled(id: string, userId: string) {
    const bill = await this.findOne(id, userId);

    if (bill.paid_by !== userId) {
      throw new ForbiddenException('Only the bill payer can mark it as settled');
    }

    if (bill.status === 'settled') {
      throw new BadRequestException('Bill is already settled');
    }

    const { data, error } = await this.supabase.admin
      .from('bills')
      .update({ status: 'settled', settled_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // Internal: create for recurring bill materialization
  // ─────────────────────────────────────────────────────────────────

  /**
   * Creates a bill from a recurring template. Called by RecurringBillsService.
   * @param recurringBillId - FK to recurring_bills.id
   */
  async createFromRecurring(
    dto: CreateBillDto,
    userId: string,
    recurringBillId: string,
  ) {
    const participants = this.ensurePayerInParticipants(dto.participants, userId);

    const { data: bill, error: billError } = await this.supabase.admin
      .from('bills')
      .insert({
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        total_amount: dto.total_amount,
        split_method: dto.split_method,
        receipt_url: dto.receipt_url ?? null,
        group_id: dto.group_id ?? null,
        paid_by: userId,
        recurring_bill_id: recurringBillId,
      })
      .select()
      .single();

    if (billError) throw new BadRequestException(billError.message);

    const participantRows = participants.map((p) => ({
      bill_id: bill.id,
      user_id: p.user_id,
      shares: p.shares ?? 1,
      percentage: p.percentage ?? null,
    }));

    const { data: insertedParticipants, error: pError } = await this.supabase.admin
      .from('bill_participants')
      .insert(participantRows)
      .select();

    if (pError) throw new BadRequestException(pError.message);

    await this.computeAndInsertSplits(
      bill.id,
      bill.total_amount,
      bill.split_method as SplitMethod,
      participants,
      userId,
      insertedParticipants as Array<{ id: string; user_id: string }>,
    );

    return bill;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private ensurePayerInParticipants(
    participants: BillParticipantInput[],
    payerId: string,
  ): BillParticipantInput[] {
    const has = participants.some((p) => p.user_id === payerId);
    if (!has) {
      return [{ user_id: payerId, shares: 1 }, ...participants];
    }
    return participants;
  }

  private async computeAndInsertSplits(
    billId: string,
    totalAmount: number,
    splitMethod: SplitMethod,
    participants: BillParticipantInput[],
    payerId: string,
    insertedParticipants: Array<{ id: string; user_id: string }>,
  ): Promise<void> {
    const strategy = getStrategy(splitMethod);
    const results = strategy.compute(totalAmount, participants, payerId);

    // Build a user_id → participant DB id lookup
    const participantIdMap = new Map<string, string>(
      insertedParticipants.map((p) => [p.user_id, p.id]),
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
