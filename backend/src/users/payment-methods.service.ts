import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { PaymentMethodV1, PaymentMethodV1Masked } from '../common/types/schema.types';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate an id in the "pm_<uuid>" format used by the PRD.
 * Uses crypto.randomUUID() which is available in Node 18+.
 */
function generateMethodId(): string {
  return `pm_${crypto.randomUUID()}`;
}

/**
 * Returns an ISO 8601 timestamp string for the current instant.
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Detects whether the stored JSONB value is v0 legacy format (array of strings)
 * rather than v1 format (array of objects).
 */
function isLegacyV0(methods: unknown[]): methods is string[] {
  return methods.length > 0 && typeof methods[0] === 'string';
}

/**
 * Mask sensitive fields so that a group co-member (non-owner) sees only
 * the last-4 digits of account_number and phone.
 * holder_name is kept in full (needed for payment confirmation).
 * updated_at is omitted from peer responses per PRD Section 6, endpoint 5 example.
 */
function maskForPeer(method: PaymentMethodV1): PaymentMethodV1Masked {
  const { updated_at: _omit, ...rest } = method;
  void _omit; // intentionally stripped from peer response
  return {
    ...rest,
    account_number: method.account_number
      ? `••••${method.account_number.slice(-4)}`
      : null,
    phone: method.phone
      ? `••••${method.phone.slice(-4)}`
      : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly supabase: SupabaseService) {}

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  /** Fetch the raw payment_methods JSONB array for a user row. */
  private async fetchRawMethods(userId: string): Promise<unknown[]> {
    const { data, error } = await this.supabase.admin
      .from('users')
      .select('payment_methods')
      .eq('id', userId)
      .single();

    if (error) throw new NotFoundException(`User ${userId} not found`);
    return (data.payment_methods as unknown[]) ?? [];
  }

  /**
   * Persist the updated methods array back to the users row.
   * Uses the admin client (service role) so RLS is bypassed — auth is
   * already enforced at the controller/guard layer.
   */
  private async persistMethods(
    userId: string,
    methods: PaymentMethodV1[],
  ): Promise<void> {
    const { error } = await this.supabase.admin
      .from('users')
      .update({ payment_methods: methods })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Parse the raw JSONB value into a typed v1 array.
   * If v0 legacy format is detected (string[]), it is returned as an
   * EMPTY array for the v1 API — the frontend is responsible for showing
   * the migration banner and prompting the user to fill in details.
   * A warning is logged so the analytics team can track v0 prevalence.
   */
  private parseV1Methods(raw: unknown[]): PaymentMethodV1[] {
    if (raw.length === 0) return [];

    if (isLegacyV0(raw)) {
      // v0 legacy data — return empty v1 list; frontend handles migration UX
      console.warn(
        '[PaymentMethodsService] v0 legacy format detected (string[]). ' +
          'Returning empty v1 array. Frontend should show migration banner.',
      );
      return [];
    }

    return raw as PaymentMethodV1[];
  }

  /**
   * Verify that requesterUserId is a group co-member of targetUserId.
   * Used before exposing a peer's payment methods.
   * Throws ForbiddenException if they share no groups.
   */
  private async assertCoMember(
    requesterUserId: string,
    targetUserId: string,
  ): Promise<void> {
    // super_admin bypasses the co-member check
    const { data: requester } = await this.supabase.admin
      .from('users')
      .select('platform_role')
      .eq('id', requesterUserId)
      .single();

    if (requester?.platform_role === 'super_admin') return;

    // Check for a shared group via group_members join
    const { data: sharedGroups, error } = await this.supabase.admin
      .from('group_members')
      .select('group_id')
      .eq('user_id', requesterUserId);

    if (error) throw error;

    if (!sharedGroups || sharedGroups.length === 0) {
      throw new ForbiddenException(
        'You must be a group co-member to view this user\'s payment methods',
      );
    }

    const requesterGroupIds = sharedGroups.map((r) => r.group_id as string);

    const { data: targetGroups, error: targetError } = await this.supabase.admin
      .from('group_members')
      .select('group_id')
      .eq('user_id', targetUserId)
      .in('group_id', requesterGroupIds);

    if (targetError) throw targetError;

    if (!targetGroups || targetGroups.length === 0) {
      throw new ForbiddenException(
        'You must be a group co-member to view this user\'s payment methods',
      );
    }
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  /**
   * GET /users/me/payment-methods
   * Returns the calling user's own payment methods in full (unmasked).
   */
  async listOwn(userId: string): Promise<{ data: PaymentMethodV1[] }> {
    const raw = await this.fetchRawMethods(userId);
    const methods = this.parseV1Methods(raw);
    return { data: methods };
  }

  /**
   * GET /users/:userId/payment-methods
   * Returns a peer's payment methods with sensitive fields masked (last-4).
   * Requester must be a group co-member of the target; throws 403 otherwise.
   * If requester === target, returns own full methods (no masking).
   */
  async listForPeer(
    targetUserId: string,
    requesterUserId: string,
  ): Promise<{ data: PaymentMethodV1[] | PaymentMethodV1Masked[] }> {
    // Validate the target user exists
    const { data: targetUser, error: targetError } = await this.supabase.admin
      .from('users')
      .select('id')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      throw new NotFoundException(`User ${targetUserId} not found`);
    }

    // Owner accessing their own — return full unmasked data
    if (requesterUserId === targetUserId) {
      return this.listOwn(targetUserId);
    }

    // Non-owner: enforce co-membership before exposing any data
    await this.assertCoMember(requesterUserId, targetUserId);

    const raw = await this.fetchRawMethods(targetUserId);
    const methods = this.parseV1Methods(raw);

    // Apply masking: account_number and phone → last-4 only
    const masked: PaymentMethodV1Masked[] = methods.map(maskForPeer);
    return { data: masked };
  }

  /**
   * POST /users/me/payment-methods
   * Creates a new payment method and appends it to the user's JSONB array.
   * If is_primary: true, all existing methods are demoted first.
   */
  async create(
    userId: string,
    dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodV1> {
    const raw = await this.fetchRawMethods(userId);
    let methods = this.parseV1Methods(raw);

    const timestamp = now();
    const newMethod: PaymentMethodV1 = {
      id: generateMethodId(),
      type: dto.type,
      label: dto.label.trim(),
      account_number: dto.account_number?.trim() ?? null,
      holder_name: dto.holder_name?.trim() ?? null,
      phone: dto.phone?.trim() ?? null,
      qris_image_path: dto.qris_image_path ?? null,
      is_primary: dto.is_primary ?? false,
      created_at: timestamp,
      updated_at: timestamp,
    };

    // If the new method is primary, demote all existing ones
    if (newMethod.is_primary) {
      methods = methods.map((m) => ({ ...m, is_primary: false }));
    }

    methods.push(newMethod);
    await this.persistMethods(userId, methods);

    return newMethod;
  }

  /**
   * PUT /users/me/payment-methods/:id
   * Updates an existing payment method by id.
   * type cannot be changed — all other fields are patchable.
   * Returns 404 if the id is not found in the user's array.
   */
  async update(
    userId: string,
    methodId: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodV1> {
    const raw = await this.fetchRawMethods(userId);
    let methods = this.parseV1Methods(raw);

    const idx = methods.findIndex((m) => m.id === methodId);
    if (idx === -1) {
      throw new NotFoundException(
        `Payment method ${methodId} not found for user ${userId}`,
      );
    }

    const existing = methods[idx];

    // If promoting to primary, demote all others first
    if (dto.is_primary === true) {
      methods = methods.map((m) => ({ ...m, is_primary: false }));
    }

    const updated: PaymentMethodV1 = {
      ...existing,
      ...(dto.label !== undefined && { label: dto.label.trim() }),
      ...(dto.account_number !== undefined && {
        account_number: dto.account_number?.trim() ?? null,
      }),
      ...(dto.holder_name !== undefined && {
        holder_name: dto.holder_name?.trim() ?? null,
      }),
      ...(dto.phone !== undefined && { phone: dto.phone?.trim() ?? null }),
      ...(dto.qris_image_path !== undefined && {
        qris_image_path: dto.qris_image_path,
      }),
      ...(dto.is_primary !== undefined && { is_primary: dto.is_primary }),
      updated_at: now(),
    };

    methods[idx] = updated;
    await this.persistMethods(userId, methods);

    return updated;
  }

  /**
   * DELETE /users/me/payment-methods/:id
   * Removes a payment method by id.
   * If the deleted method was primary, the oldest remaining method is
   * promoted to primary (by created_at ascending).
   * Returns 404 if the id is not found.
   */
  async delete(userId: string, methodId: string): Promise<void> {
    const raw = await this.fetchRawMethods(userId);
    const methods = this.parseV1Methods(raw);

    const idx = methods.findIndex((m) => m.id === methodId);
    if (idx === -1) {
      throw new NotFoundException(
        `Payment method ${methodId} not found for user ${userId}`,
      );
    }

    const wasPrimary = methods[idx].is_primary;
    const remaining = methods.filter((m) => m.id !== methodId);

    // Auto-promote oldest remaining method if we deleted the primary
    if (wasPrimary && remaining.length > 0) {
      // Sort by created_at ascending to find the oldest
      const oldest = remaining.reduce((prev, curr) =>
        prev.created_at < curr.created_at ? prev : curr,
      );
      const promoteIdx = remaining.findIndex((m) => m.id === oldest.id);
      remaining[promoteIdx] = {
        ...remaining[promoteIdx],
        is_primary: true,
        updated_at: now(),
      };
    }

    await this.persistMethods(userId, remaining);
  }
}
