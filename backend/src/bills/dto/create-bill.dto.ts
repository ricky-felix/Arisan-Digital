import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
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

export class CreateBillDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BILL_CATEGORIES)
  category?: BillCategory;

  /** Total bill amount in IDR (BIGINT). Minimum 1. */
  @IsInt()
  @Min(1)
  total_amount: number;

  @IsEnum(SPLIT_METHODS)
  split_method: SplitMethod;

  @IsOptional()
  @IsUrl()
  receipt_url?: string;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillParticipantInput)
  participants: BillParticipantInput[];
}
