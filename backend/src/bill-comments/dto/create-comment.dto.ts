import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  bill_id: string;

  @IsString()
  @MinLength(1)
  body: string;

  /** UUID of parent comment for threaded replies. Null/absent = top-level. */
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
