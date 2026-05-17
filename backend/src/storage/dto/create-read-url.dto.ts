import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ALLOWED_BUCKETS, AllowedBucket } from './create-upload-url.dto';

export class CreateReadUrlDto {
  @IsIn(ALLOWED_BUCKETS, {
    message: `bucket must be one of: ${ALLOWED_BUCKETS.join(', ')}`,
  })
  bucket: AllowedBucket;

  /**
   * Storage path of the object (e.g. "<userId>/<uuid>-filename.jpg").
   * The service validates that the path is owned by the requesting user.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  path: string;

  /**
   * Signed URL validity in seconds.
   * Defaults to 3600 (1 hour). Maximum is 86400 (24 hours).
   */
  @IsOptional()
  @IsInt()
  @Min(60, { message: 'expires_in_seconds must be at least 60' })
  @Max(86400, { message: 'expires_in_seconds cannot exceed 86400 (24 hours)' })
  expires_in_seconds?: number;
}
