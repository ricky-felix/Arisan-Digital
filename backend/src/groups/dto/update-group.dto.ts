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

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @IsOptional()
  @IsInt()
  @Min(1000)
  amount_per_round?: number;

  @IsOptional()
  @IsIn(['weekly', 'monthly'])
  frequency?: Frequency;

  @IsOptional()
  @IsIn(['random', 'manual'])
  giliran_method?: GiliranMethod;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  total_rounds?: number;
}
