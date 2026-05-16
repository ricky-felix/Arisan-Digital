import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findForGroup(groupId: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .select('*, profiles(full_name)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findForUser(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .select('*, groups(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(dto: CreatePaymentDto, userId: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .insert({ ...dto, user_id: userId, status: 'pending' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async confirm(id: string) {
    const { data, error } = await this.supabase.admin
      .from('payments')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
