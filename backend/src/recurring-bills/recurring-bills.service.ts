import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { BillsService } from '../bills/bills.service';
import type { CreateRecurringBillDto } from './dto/create-recurring-bill.dto';
import type { UpdateRecurringBillDto } from './dto/update-recurring-bill.dto';
import type { BillParticipantInput } from '../bills/strategies/split-strategy.interface';
import type { RecurringFrequency, SplitMethod } from '../common/types/schema.types';

@Injectable()
export class RecurringBillsService {
  constructor(
    private readonly supabase: SupabaseService,
    @Inject(forwardRef(() => BillsService))
    private readonly billsService: BillsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────────────────────────

  async create(dto: CreateRecurringBillDto, userId: string) {
    const { data, error } = await this.supabase.admin
      .from('recurring_bills')
      .insert({
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        total_amount: dto.total_amount,
        split_method: dto.split_method,
        frequency: dto.frequency,
        start_date: dto.start_date,
        end_date: dto.end_date ?? null,
        next_due_date: dto.next_due_date,
        is_active: dto.is_active ?? true,
        participants: JSON.stringify(dto.participants),
        group_id: dto.group_id ?? null,
        paid_by: userId,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabase.admin
      .from('recurring_bills')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) throw new NotFoundException(`RecurringBill ${id} not found`);
    if (data.paid_by !== userId) {
      throw new ForbiddenException('You do not have access to this recurring bill');
    }
    return data;
  }

  async listMine(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('recurring_bills')
      .select('*')
      .eq('paid_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateRecurringBillDto, userId: string) {
    await this.findOne(id, userId); // ownership check

    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.total_amount !== undefined) patch.total_amount = dto.total_amount;
    if (dto.split_method !== undefined) patch.split_method = dto.split_method;
    if (dto.frequency !== undefined) patch.frequency = dto.frequency;
    if (dto.start_date !== undefined) patch.start_date = dto.start_date;
    if (dto.end_date !== undefined) patch.end_date = dto.end_date;
    if (dto.next_due_date !== undefined) patch.next_due_date = dto.next_due_date;
    if (dto.is_active !== undefined) patch.is_active = dto.is_active;
    if (dto.group_id !== undefined) patch.group_id = dto.group_id;
    if (dto.participants !== undefined) patch.participants = JSON.stringify(dto.participants);
    patch.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase.admin
      .from('recurring_bills')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId); // ownership check

    const { error } = await this.supabase.admin
      .from('recurring_bills')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'RecurringBill deleted' };
  }

  // ─────────────────────────────────────────────────────────────────
  // MATERIALIZE DUE BILLS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Finds all active recurring bills whose next_due_date <= now,
   * creates a real bill for each, then advances next_due_date by frequency.
   * Returns the count of bills created.
   */
  async materializeDue(now: Date): Promise<{ created: number }> {
    const todayStr = this.toDateString(now);

    const { data: dueBills, error } = await this.supabase.admin
      .from('recurring_bills')
      .select('*')
      .eq('is_active', true)
      .lte('next_due_date', todayStr);

    if (error) throw new BadRequestException(error.message);
    if (!dueBills || dueBills.length === 0) return { created: 0 };

    let created = 0;

    for (const rb of dueBills as Array<Record<string, unknown>>) {
      try {
        // Parse participants JSONB back into BillParticipantInput[]
        const participants: BillParticipantInput[] =
          typeof rb.participants === 'string'
            ? (JSON.parse(rb.participants) as BillParticipantInput[])
            : (rb.participants as BillParticipantInput[]);

        await this.billsService.createFromRecurring(
          {
            title: rb.title as string,
            description: rb.description as string | undefined,
            category: rb.category as never,
            total_amount: rb.total_amount as number,
            split_method: rb.split_method as SplitMethod,
            receipt_url: undefined,
            group_id: rb.group_id as string | undefined,
            participants,
          },
          rb.paid_by as string,
          rb.id as string,
        );

        created++;

        // Advance next_due_date and clamp to end_date
        const nextDue = this.advanceDate(
          new Date(rb.next_due_date as string),
          rb.frequency as RecurringFrequency,
        );

        const endDate = rb.end_date ? new Date(rb.end_date as string) : null;
        const isStillActive = endDate ? nextDue <= endDate : true;

        await this.supabase.admin
          .from('recurring_bills')
          .update({
            next_due_date: this.toDateString(nextDue),
            is_active: isStillActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rb.id);
      } catch (err) {
        // Log per-bill failure and continue so one bad record doesn't block others
        console.error(`[RecurringBillsService] Failed to materialize bill ${rb.id as string}`, err);
      }
    }

    return { created };
  }

  // ─────────────────────────────────────────────────────────────────
  // Private date helpers
  // ─────────────────────────────────────────────────────────────────

  private advanceDate(date: Date, frequency: RecurringFrequency): Date {
    const next = new Date(date);
    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  private toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
