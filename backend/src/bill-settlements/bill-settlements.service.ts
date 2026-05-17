import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateSettlementDto } from './dto/create-settlement.dto';
import type { RejectSettlementDto } from './dto/reject-settlement.dto';

@Injectable()
export class BillSettlementsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────

  async create(dto: CreateSettlementDto, userId: string) {
    // Validate payer is a participant of the bill
    const { data: participantRow } = await this.supabase.admin
      .from('bill_participants')
      .select('id')
      .eq('bill_id', dto.bill_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!participantRow) {
      throw new ForbiddenException('You are not a participant of this bill');
    }

    // Validate receiver is the bill payer (paid_by)
    const { data: bill } = await this.supabase.admin
      .from('bills')
      .select('id, paid_by, title, status')
      .eq('id', dto.bill_id)
      .maybeSingle();

    if (!bill) throw new NotFoundException(`Bill ${dto.bill_id} not found`);

    if (bill.status === 'settled') {
      throw new BadRequestException('Bill is already fully settled');
    }

    if (bill.paid_by !== dto.receiver_id) {
      throw new BadRequestException('receiver_id must be the bill payer');
    }

    if (userId === dto.receiver_id) {
      throw new BadRequestException('Payer cannot settle a debt to themselves');
    }

    const { data: settlement, error } = await this.supabase.admin
      .from('bill_settlements')
      .insert({
        bill_id: dto.bill_id,
        payer_id: userId,
        receiver_id: dto.receiver_id,
        amount: dto.amount,
        proof_url: dto.proof_url ?? null,
        notes: dto.notes ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return settlement;
  }

  // ─────────────────────────────────────────────────────────────────
  // CONFIRM
  // ─────────────────────────────────────────────────────────────────

  async confirm(id: string, userId: string) {
    const settlement = await this.requireSettlement(id);

    if (settlement.receiver_id !== userId) {
      throw new ForbiddenException('Only the settlement receiver can confirm it');
    }

    if (settlement.status !== 'pending') {
      throw new BadRequestException(`Settlement is already ${settlement.status as string}`);
    }

    const now = new Date().toISOString();
    const { data: updated, error } = await this.supabase.admin
      .from('bill_settlements')
      .update({ status: 'confirmed', confirmed_at: now, settled_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Check if all non-payer participants now have confirmed settlements
    await this.checkAndAutoSettle(settlement.bill_id as string, userId);

    // Notify the payer that their settlement was confirmed
    await this.notifications.create({
      user_id: settlement.payer_id as string,
      type: 'settlement_confirmed',
      title: 'Pembayaran dikonfirmasi',
      body: `Pembayaranmu sebesar Rp ${(settlement.amount as number).toLocaleString('id-ID')} telah dikonfirmasi`,
      metadata: { settlement_id: id, bill_id: settlement.bill_id as string },
    });

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────
  // REJECT
  // ─────────────────────────────────────────────────────────────────

  async reject(id: string, dto: RejectSettlementDto, userId: string) {
    const settlement = await this.requireSettlement(id);

    if (settlement.receiver_id !== userId) {
      throw new ForbiddenException('Only the settlement receiver can reject it');
    }

    if (settlement.status !== 'pending') {
      throw new BadRequestException(`Settlement is already ${settlement.status as string}`);
    }

    // Store rejection reason in notes with a "REJECTED: " prefix since
    // bill_settlements has no dedicated rejection_reason column.
    const updatedNotes = `REJECTED: ${dto.reason}`;

    const { data: updated, error } = await this.supabase.admin
      .from('bill_settlements')
      .update({ status: 'rejected', notes: updatedNotes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Notify the payer
    await this.notifications.create({
      user_id: settlement.payer_id as string,
      type: 'settlement_rejected',
      title: 'Pembayaran ditolak',
      body: `Pembayaranmu ditolak: ${dto.reason}`,
      metadata: { settlement_id: id, bill_id: settlement.bill_id as string },
    });

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────
  // LIST
  // ─────────────────────────────────────────────────────────────────

  async listForBill(billId: string, userId: string) {
    // Verify caller is a participant or payer
    await this.requireBillAccess(billId, userId);

    const { data, error } = await this.supabase.admin
      .from('bill_settlements')
      .select('*')
      .eq('bill_id', billId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async listMine(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('bill_settlements')
      .select('*')
      .or(`payer_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private async requireSettlement(id: string) {
    const { data } = await this.supabase.admin
      .from('bill_settlements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!data) throw new NotFoundException(`Settlement ${id} not found`);
    return data;
  }

  private async requireBillAccess(billId: string, userId: string) {
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
      throw new ForbiddenException('You do not have access to this bill');
    }
  }

  /**
   * After a settlement is confirmed, check if all non-payer participants have
   * at least one confirmed settlement for this bill. If so, auto-settle the bill.
   */
  private async checkAndAutoSettle(billId: string, _confirmerId: string): Promise<void> {
    const { data: bill } = await this.supabase.admin
      .from('bills')
      .select('id, paid_by, status, title')
      .eq('id', billId)
      .maybeSingle();

    if (!bill || bill.status === 'settled') return;

    const { data: participants } = await this.supabase.admin
      .from('bill_participants')
      .select('user_id')
      .eq('bill_id', billId)
      .neq('user_id', bill.paid_by);

    if (!participants || participants.length === 0) return;

    const nonPayerIds = (participants as Array<{ user_id: string }>).map((p) => p.user_id);

    // Check each non-payer has a confirmed settlement
    const { data: confirmedSettlements } = await this.supabase.admin
      .from('bill_settlements')
      .select('payer_id')
      .eq('bill_id', billId)
      .eq('status', 'confirmed');

    const confirmedPayerIds = new Set(
      (confirmedSettlements ?? []).map((s: { payer_id: string }) => s.payer_id),
    );

    const allSettled = nonPayerIds.every((id) => confirmedPayerIds.has(id));

    if (allSettled) {
      await this.supabase.admin
        .from('bills')
        .update({ status: 'settled', settled_at: new Date().toISOString() })
        .eq('id', billId);
    }
  }
}
