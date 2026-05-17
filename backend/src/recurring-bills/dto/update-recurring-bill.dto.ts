import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { BillCategory, RecurringFrequency, SplitMethod } from '../../common/types/schema.types';
import { BillParticipantInput } from '../../bills/dto/bill-participant-input.dto';

const BILL_CATEGORIES: BillCategory[] = [
  'food', 'transport', 'accommodation', 'utilities',
  'entertainment', 'shopping', 'other',
];
const SPLIT_METHODS: SplitMethod[] = ['equal', 'exact', 'percentage', 'shares'];
const FREQUENCIES: RecurringFrequency[] = ['weekly', 'monthly', 'yearly'];

export class UpdateRecurringBillDto {
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
  @IsInt()
  @Min(1)
  total_amount?: number;

  @IsOptional()
  @IsEnum(SPLIT_METHODS)
  split_method?: SplitMethod;

  @IsOptional()
  @IsEnum(FREQUENCIES)
  frequency?: RecurringFrequency;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsDateString()
  next_due_date?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillParticipantInput)
  participants?: BillParticipantInput[];
}
