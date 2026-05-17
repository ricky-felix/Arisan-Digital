import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  round_id: string;

  @IsInt()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsUrl()
  proof_url?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
