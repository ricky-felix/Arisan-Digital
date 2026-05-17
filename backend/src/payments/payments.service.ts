import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  NotificationsService,
} from '../notifications/notifications.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  async findForRound(roundId: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .select('*')
      .eq('round_id', roundId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findForGroup(groupId: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findMine(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .select('*, groups(name), rounds(round_number, scheduled_date)')
      .eq('payer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(dto: CreatePaymentDto, userId: string) {
    // Resolve group_id from the round
    const { data: round, error: roundError } = await this.supabase.admin
      .from('rounds')
      .select('id, group_id')
      .eq('id', dto.round_id)
      .maybeSingle();

    if (roundError) throw roundError;
    if (!round) throw new NotFoundException(`Round ${dto.round_id} not found`);

    const { data, error } = await this.supabase.admin
      .from('payments')
      .insert({
        group_id: round.group_id,
        round_id: dto.round_id,
        payer_id: userId,
        amount: dto.amount,
        status: 'pending',
        proof_url: dto.proof_url ?? null,
        notes: dto.notes ?? null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'You have already submitted a payment for this round',
        );
      }
      throw error;
    }

    return data;
  }

  async confirm(id: string, requesterId: string) {
    const payment = await this.findPaymentOrThrow(id);
    await this.assertGroupAdmin(payment.group_id, requesterId);

    if (payment.status !== 'pending') {
      throw new BadRequestException(
        `Payment cannot be confirmed — current status is '${payment.status}'`,
      );
    }

    const { data, error } = await this.supabase.admin
      .from('payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify the payer
    await this.notifications.create({
      user_id: payment.payer_id,
      type: 'payment_confirmed',
      title: 'Pembayaran Dikonfirmasi',
      body: `Pembayaran sebesar Rp ${payment.amount.toLocaleString('id-ID')} telah dikonfirmasi.`,
      metadata: { payment_id: id, group_id: payment.group_id, round_id: payment.round_id },
    });

    return data;
  }

  async reject(id: string, dto: RejectPaymentDto, requesterId: string) {
    const payment = await this.findPaymentOrThrow(id);
    await this.assertGroupAdmin(payment.group_id, requesterId);

    if (payment.status !== 'pending') {
      throw new BadRequestException(
        `Payment cannot be rejected — current status is '${payment.status}'`,
      );
    }

    const { data, error } = await this.supabase.admin
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: dto.rejection_reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify the payer
    await this.notifications.create({
      user_id: payment.payer_id,
      type: 'payment_rejected',
      title: 'Pembayaran Ditolak',
      body: `Pembayaran Anda ditolak: ${dto.rejection_reason}`,
      metadata: { payment_id: id, group_id: payment.group_id, round_id: payment.round_id },
    });

    return data;
  }

  private async findPaymentOrThrow(id: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Payment ${id} not found`);
    return data;
  }

  /** Asserts the requester is the admin_id OR has group_role='admin' */
  private async assertGroupAdmin(groupId: string, userId: string): Promise<void> {
    const { data: group } = await this.supabase.admin
      .from('groups')
      .select('admin_id')
      .eq('id', groupId)
      .maybeSingle();

    if (!group) throw new NotFoundException(`Group ${groupId} not found`);
    if (group.admin_id === userId) return;

    const { data: membership } = await this.supabase.admin
      .from('group_members')
      .select('group_role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (membership?.group_role !== 'admin') {
      throw new ForbiddenException('You are not an admin of this group');
    }
  }
}
