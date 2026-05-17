import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

export type ContactSortOption = 'recent' | 'frequent' | 'name';

export interface ListContactsOptions {
  /** Sort order. Defaults to 'recent'. */
  sort?: ContactSortOption;
  /** Maximum number of rows to return. Defaults to 50. */
  limit?: number;
}

@Injectable()
export class ContactsService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Returns the authenticated user's contacts with flexible sort options.
   *
   * - 'recent'   → last_used_at DESC NULLS LAST  (default)
   * - 'frequent' → use_count DESC
   * - 'name'     → name ASC (alphabetical)
   */
  async listMine(userId: string, opts: ListContactsOptions = {}) {
    const { sort = 'recent', limit = 50 } = opts;

    let query = this.supabase.admin
      .from('user_contacts')
      .select('*')
      .eq('owner_id', userId)
      .limit(limit);

    switch (sort) {
      case 'frequent':
        query = query.order('use_count', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'recent':
      default:
        // NULLS LAST: contacts never used appear at the bottom
        query = query
          .order('last_used_at', { ascending: false, nullsFirst: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Returns the N most recently used contacts for the given user.
   * Convenience wrapper over listMine() used by the /recents endpoint.
   */
  async recents(userId: string, limit = 10) {
    return this.listMine(userId, { sort: 'recent', limit });
  }

  /**
   * Creates a new contact for the authenticated user.
   *
   * Business rules:
   * - At least one of `phone` or `contact_id` must be provided (enforced here
   *   as well as in the DTO for defence-in-depth).
   * - If `phone` is supplied and matches an existing platform user, `contact_id`
   *   is auto-resolved.
   * - Upserts on (owner_id, phone) so that retrying the same request does not
   *   produce an error — the contact name is refreshed instead.
   */
  async create(dto: CreateContactDto, userId: string) {
    if (!dto.phone && !dto.contact_id) {
      throw new BadRequestException(
        'At least one of phone or contact_id must be provided',
      );
    }

    let resolvedContactId = dto.contact_id ?? null;

    // Auto-resolve contact_id from phone when it has not been supplied
    if (dto.phone && !resolvedContactId) {
      const { data: matchedUser } = await this.supabase.admin
        .from('users')
        .select('id')
        .eq('phone', dto.phone)
        .maybeSingle();

      if (matchedUser) {
        resolvedContactId = matchedUser.id as string;
      }
    }

    const payload: Record<string, unknown> = {
      owner_id: userId,
      name: dto.name,
      contact_id: resolvedContactId,
    };

    if (dto.phone) {
      payload.phone = dto.phone;
    }

    const { data, error } = await this.supabase.admin
      .from('user_contacts')
      // Upsert on the unique constraint (owner_id, phone).
      // When phone is null we fall back to a plain insert; the DB unique index
      // only applies to non-null phone values so there is no conflict risk.
      .upsert(payload, {
        onConflict: dto.phone ? 'owner_id,phone' : undefined,
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Updates a contact that belongs to the authenticated user.
   * Throws NotFoundException when the row does not exist and ForbiddenException
   * when it exists but belongs to a different user.
   */
  async update(id: string, dto: UpdateContactDto, userId: string) {
    await this.assertOwnership(id, userId);

    const { data, error } = await this.supabase.admin
      .from('user_contacts')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletes a contact that belongs to the authenticated user.
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);

    const { error } = await this.supabase.admin
      .from('user_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Bumps use_count by 1 and sets last_used_at = now() for the contact
   * identified by `phoneOrContactUserId`.
   *
   * Called internally by bills / group-members services when a participant is
   * added by phone. The caller passes either a phone string or a platform user
   * UUID — the method detects which kind via a UUID regex check.
   *
   * Idempotent: a missing contact row is a no-op (the caller is responsible for
   * creating the contact first).
   */
  async touch(userId: string, phoneOrContactUserId: string): Promise<void> {
    if (!phoneOrContactUserId) {
      throw new BadRequestException(
        'phone or contact_id must be provided for touch',
      );
    }

    // UUID v4 pattern
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let query = this.supabase.admin
      .from('user_contacts')
      .select('id, use_count')
      .eq('owner_id', userId);

    if (uuidRegex.test(phoneOrContactUserId)) {
      query = query.eq('contact_id', phoneOrContactUserId);
    } else {
      query = query.eq('phone', phoneOrContactUserId);
    }

    const { data: contact } = await query.maybeSingle();

    // No matching contact — idempotent no-op
    if (!contact) return;

    const { error } = await this.supabase.admin
      .from('user_contacts')
      .update({
        use_count: (contact.use_count as number) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', contact.id);

    if (error) throw error;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Fetches the contact row and verifies ownership.
   * Throws NotFoundException / ForbiddenException as appropriate.
   */
  private async assertOwnership(id: string, userId: string) {
    const { data: contact, error } = await this.supabase.admin
      .from('user_contacts')
      .select('id, owner_id')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    if ((contact as { owner_id: string }).owner_id !== userId) {
      throw new ForbiddenException('You do not own this contact');
    }

    return contact;
  }
}
