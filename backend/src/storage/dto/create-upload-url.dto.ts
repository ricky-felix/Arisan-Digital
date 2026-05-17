import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Expected buckets (must be created manually in Supabase Dashboard → Storage):
 *   - avatars         : user profile pictures
 *   - receipts        : bill receipt photos
 *   - payment-proofs  : arisan iuran payment proof images
 *
 * All three buckets must be configured as PRIVATE in Supabase so that
 * direct public access is blocked and all reads go through signed URLs.
 */
export const ALLOWED_BUCKETS = ['avatars', 'receipts', 'payment-proofs'] as const;
export type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

export class CreateUploadUrlDto {
  @IsIn(ALLOWED_BUCKETS, {
    message: `bucket must be one of: ${ALLOWED_BUCKETS.join(', ')}`,
  })
  bucket: AllowedBucket;

  /**
   * Original filename provided by the client. Path separators are stripped in
   * the service layer before the path is constructed; only the basename is used.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  /**
   * MIME type hint (e.g. 'image/jpeg'). Optional — passed through to storage
   * metadata but does not affect signed-URL generation.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  content_type?: string;
}
