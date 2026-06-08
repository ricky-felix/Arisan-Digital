import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { UpsertBankAccountDto } from './dto/upsert-bank-account.dto';

const BCRYPT_ROUNDS = 12;

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

  // ─────────────────────────────────────────────────
  // C2 — PIN SECURITY
  // ─────────────────────────────────────────────────

  async setPin(userId: string, dto: SetPinDto): Promise<{ success: boolean }> {
    const pin_hash = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);

    const { error } = await this.supabase.admin
      .from('users')
      .update({ pin_hash })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  }

  async verifyPin(userId: string, dto: VerifyPinDto): Promise<{ valid: boolean }> {
    const { data, error } = await this.supabase.admin
      .from('users')
      .select('pin_hash')
      .eq('id', userId)
      .single();

    if (error) throw new NotFoundException(`User ${userId} not found`);

    if (!data.pin_hash) {
      return { valid: false };
    }

    const valid = await bcrypt.compare(dto.pin, data.pin_hash);
    return { valid };
  }

  async getSecurity(userId: string): Promise<{ has_pin: boolean; app_lock_enabled: boolean }> {
    const { data, error } = await this.supabase.admin
      .from('users')
      .select('pin_hash, app_lock_enabled')
      .eq('id', userId)
      .single();

    if (error) throw new NotFoundException(`User ${userId} not found`);

    return {
      has_pin: !!data.pin_hash,
      app_lock_enabled: data.app_lock_enabled ?? false,
    };
  }

  async updateSecurity(
    userId: string,
    dto: UpdateSecurityDto,
  ): Promise<{ has_pin: boolean; app_lock_enabled: boolean }> {
    const { error } = await this.supabase.admin
      .from('users')
      .update({ app_lock_enabled: dto.app_lock_enabled })
      .eq('id', userId);

    if (error) throw error;

    return this.getSecurity(userId);
  }

  // ─────────────────────────────────────────────────
  // C3 — PAYOUT / BANK ACCOUNT
  // ─────────────────────────────────────────────────

  async getBankAccount(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('bank_accounts')
      .select('id, bank, account_number, holder_name, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data; // null when no row exists
  }

  async upsertBankAccount(userId: string, dto: UpsertBankAccountDto) {
    const { data, error } = await this.supabase.admin
      .from('bank_accounts')
      .upsert(
        {
          user_id: userId,
          bank: dto.bank,
          account_number: dto.account_number,
          holder_name: dto.holder_name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false },
      )
      .select('id, bank, account_number, holder_name, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBankAccount(userId: string): Promise<{ success: boolean }> {
    const { error } = await this.supabase.admin
      .from('bank_accounts')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
}
