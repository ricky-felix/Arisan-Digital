import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  IsDateString,
  IsIn,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import type { Frequency, GiliranMethod } from '../../common/types/schema.types';

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @IsInt()
  @Min(1000)
  amount_per_round: number;

  @IsIn(['weekly', 'monthly'])
  frequency: Frequency;

  @IsIn(['random', 'manual'])
  giliran_method: GiliranMethod;

  @IsDateString()
  start_date: string;

  @IsInt()
  @Min(2)
  total_rounds: number;
}
