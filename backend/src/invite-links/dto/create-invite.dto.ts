import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateInviteDto {
  @IsUUID()
  group_id: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_uses?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
