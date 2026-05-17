import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { BillCategory, SplitMethod } from '../../common/types/schema.types';
import { BillParticipantInput } from './bill-participant-input.dto';

const BILL_CATEGORIES: BillCategory[] = [
  'food', 'transport', 'accommodation', 'utilities',
  'entertainment', 'shopping', 'other',
];

const SPLIT_METHODS: SplitMethod[] = ['equal', 'exact', 'percentage', 'shares'];

/**
 * All fields optional. Mutating total_amount, split_method, or participants
 * causes the service to delete and recompute bill_splits.
 */
export class UpdateBillDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BILL_CATEGORIES)
  category?: BillCategory;

  @IsOptional()
  @IsUrl()
  receipt_url?: string;

  /** Changing total_amount triggers a split recomputation. */
  @IsOptional()
  @IsInt()
  @Min(1)
  total_amount?: number;

  /** Changing split_method triggers a split recomputation. */
  @IsOptional()
  @IsEnum(SPLIT_METHODS)
  split_method?: SplitMethod;

  /** Providing participants triggers a split recomputation. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillParticipantInput)
  participants?: BillParticipantInput[];
}
