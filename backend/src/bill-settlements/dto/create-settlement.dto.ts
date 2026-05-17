import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSettlementDto {
  @IsUUID()
  bill_id: string;

  @IsUUID()
  receiver_id: string;

  /** Amount being settled in IDR (BIGINT). Minimum 1. */
  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsUrl()
  proof_url?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
