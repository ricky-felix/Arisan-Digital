import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ALLOWED_BUCKETS, AllowedBucket } from './create-upload-url.dto';

export class DeleteObjectDto {
  @IsIn(ALLOWED_BUCKETS, {
    message: `bucket must be one of: ${ALLOWED_BUCKETS.join(', ')}`,
  })
  bucket: AllowedBucket;

  /**
   * Storage path of the object to delete (e.g. "<userId>/<uuid>-filename.jpg").
   * The service validates that the path is owned by the requesting user.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  path: string;
}
