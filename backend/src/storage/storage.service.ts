import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { SupabaseService } from '../supabase/supabase.service';
import { ALLOWED_BUCKETS, AllowedBucket, CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { CreateReadUrlDto } from './dto/create-read-url.dto';

/**
 * Default signed-URL validity when the caller does not specify expires_in_seconds.
 */
const DEFAULT_EXPIRES_IN_SECONDS = 3600; // 1 hour

@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Issues a Supabase Storage signed upload URL so the frontend can upload
   * directly without forwarding the user's auth token to the backend.
   *
   * Path format: `<userId>/<uuid>-<sanitisedFilename>`
   *
   * Expected buckets (created manually in Supabase Dashboard → Storage):
   *   - avatars         : private bucket for user profile pictures
   *   - receipts        : private bucket for bill receipt photos
   *   - payment-proofs  : private bucket for iuran payment proof images
   *
   * @returns { bucket, path, signed_url, token }
   */
  async createUploadUrl(
    dto: CreateUploadUrlDto,
    userId: string,
  ): Promise<{ bucket: string; path: string; signed_url: string; token: string }> {
    this.validateBucket(dto.bucket);

    const sanitisedFilename = this.sanitiseFilename(dto.filename);
    const objectPath = `${userId}/${randomUUID()}-${sanitisedFilename}`;

    const { data, error } = await this.supabase.admin.storage
      .from(dto.bucket)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to create signed upload URL: ${error?.message ?? 'unknown error'}`,
      );
    }

    return {
      bucket: dto.bucket,
      path: objectPath,
      signed_url: data.signedUrl,
      token: data.token,
    };
  }

  /**
   * Issues a Supabase Storage signed read URL for an existing object.
   *
   * Ownership rule: the object path must start with `<userId>/`.
   * super_admin users may read any path in any bucket.
   *
   * @returns { signed_url, expires_at }
   */
  async createReadUrl(
    dto: CreateReadUrlDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<{ signed_url: string; expires_at: string }> {
    this.validateBucket(dto.bucket);
    this.assertPathOwnership(dto.path, userId, isSuperAdmin);

    const expiresIn = dto.expires_in_seconds ?? DEFAULT_EXPIRES_IN_SECONDS;

    const { data, error } = await this.supabase.admin.storage
      .from(dto.bucket)
      .createSignedUrl(dto.path, expiresIn);

    if (error || !data?.signedUrl) {
      throw new InternalServerErrorException(
        `Failed to create signed read URL: ${error?.message ?? 'unknown error'}`,
      );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return {
      signed_url: data.signedUrl,
      expires_at: expiresAt,
    };
  }

  /**
   * Deletes a storage object.
   *
   * Ownership rule: the object path must start with `<userId>/`.
   * super_admin users may delete any path in any bucket.
   */
  async delete(
    bucket: AllowedBucket,
    objectPath: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<void> {
    this.validateBucket(bucket);
    this.assertPathOwnership(objectPath, userId, isSuperAdmin);

    const { error } = await this.supabase.admin.storage
      .from(bucket)
      .remove([objectPath]);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to delete storage object: ${error.message}`,
      );
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Guards against callers supplying an arbitrary bucket name outside the
   * allowlist — the DTO validator already does this, but defence-in-depth
   * is appropriate for storage operations.
   */
  private validateBucket(bucket: string): void {
    if (!ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
      throw new BadRequestException(
        `Invalid bucket. Allowed buckets: ${ALLOWED_BUCKETS.join(', ')}`,
      );
    }
  }

  /**
   * Ensures the storage path is owned by the requesting user.
   * Paths are structured as `<userId>/<rest>` by this service's createUploadUrl().
   * super_admin bypasses this check entirely.
   */
  private assertPathOwnership(
    objectPath: string,
    userId: string,
    isSuperAdmin: boolean,
  ): void {
    if (isSuperAdmin) return;

    if (!objectPath.startsWith(`${userId}/`)) {
      throw new ForbiddenException(
        'You do not have permission to access this storage object',
      );
    }
  }

  /**
   * Strips path separators from a filename so that a malicious caller cannot
   * escape the user's directory by supplying names like `../../other-user/file`.
   *
   * Strategy:
   *   1. Take only the basename (everything after the last `/` or `\`).
   *   2. Replace any remaining path-separator characters with `_`.
   *   3. Collapse whitespace runs to a single underscore for cleaner URLs.
   *   4. Fall back to 'file' when the result is empty.
   */
  private sanitiseFilename(filename: string): string {
    // Step 1: extract basename only (cross-platform)
    let sanitised = path.basename(filename);

    // Step 2: replace path separators that may survive basename on Windows
    sanitised = sanitised.replace(/[/\\]/g, '_');

    // Step 3: collapse whitespace
    sanitised = sanitised.replace(/\s+/g, '_');

    // Step 4: fallback
    return sanitised.length > 0 ? sanitised : 'file';
  }
}
