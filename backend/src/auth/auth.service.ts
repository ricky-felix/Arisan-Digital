import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Promote the phone the user registered with — stored in their auth metadata
   * by the frontend `signUp` call — onto the top-level `auth.users.phone` field,
   * marking it confirmed.
   *
   * Why this exists: phone+password login (`signInWithPassword({ phone })`) looks
   * users up by `auth.users.phone`, but `signUp` can't populate it — it accepts
   * EITHER an email OR a phone credential, never both. So registration uses email
   * as the credential and stashes the phone in user metadata; this step copies it
   * onto the auth record so phone login actually works.
   *
   * Safe to call unauthenticated immediately after signUp (when "Confirm email"
   * is enabled there is no session yet). It only ever promotes a user's OWN
   * already-stored metadata phone — no caller-supplied value lands on the account —
   * so it is idempotent and harmless even if called with an arbitrary userId.
   */
  async syncPhone(userId: string): Promise<{ synced: boolean }> {
    const { data, error } =
      await this.supabase.admin.auth.admin.getUserById(userId);
    if (error || !data?.user) {
      this.logger.warn(`syncPhone: user ${userId} not found`);
      return { synced: false };
    }

    const user = data.user;
    const metaPhone = (user.user_metadata?.phone as string | undefined)?.trim();

    // Nothing to do: no phone on file, or it is already set on the auth record.
    if (!metaPhone || user.phone) return { synced: false };

    const { error: updateError } =
      await this.supabase.admin.auth.admin.updateUserById(userId, {
        phone: metaPhone,
        phone_confirm: true,
      });
    if (updateError) {
      // Non-fatal: registration already succeeded. The most likely cause is the
      // phone being claimed by another account — log it and leave the account as
      // email-only rather than failing the request.
      this.logger.warn(
        `syncPhone: could not set phone for ${userId}: ${updateError.message}`,
      );
      return { synced: false };
    }

    return { synced: true };
  }
}
