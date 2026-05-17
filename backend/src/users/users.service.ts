import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new NotFoundException(`User ${userId} not found`);
    return data;
  }

  // Upserts the profile row when a brand-new auth user signs up
  async ensureProfile(userId: string, defaults: { name: string; phone?: string }) {
    const { data, error } = await this.supabase.admin
      .from('users')
      .upsert(
        { id: userId, name: defaults.name, phone: defaults.phone },
        { onConflict: 'id', ignoreDuplicates: false },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const { data, error } = await this.supabase.admin
      .from('users')
      .update(dto)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.supabase.admin
      .from('users')
      .select('id, name, phone, avatar_url, platform_role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
