import {
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AddParticipantDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  shares?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  exact_amount?: number;
}
