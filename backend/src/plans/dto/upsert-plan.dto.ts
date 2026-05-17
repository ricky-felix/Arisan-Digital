import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';

export class UpsertPlanDto {
  /**
   * Unique identifier slug — required on create, immutable on update.
   * Values: 'free' | 'boss' | 'business' or a new custom slug.
   */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  description?: string;

  /** Monthly price in IDR (integer, no decimals). 0 = free. */
  @IsOptional()
  @IsInt()
  @Min(0)
  price_monthly?: number;

  /** Yearly price in IDR (integer, no decimals). 0 = free. */
  @IsOptional()
  @IsInt()
  @Min(0)
  price_yearly?: number;

  /** NULL = unlimited */
  @IsOptional()
  @IsInt()
  @IsPositive()
  max_groups?: number | null;

  /** NULL = unlimited */
  @IsOptional()
  @IsInt()
  @IsPositive()
  max_members_per_group?: number | null;

  /** NULL = unlimited */
  @IsOptional()
  @IsInt()
  @IsPositive()
  max_bills_per_month?: number | null;

  @IsOptional()
  @IsBoolean()
  recurring_bills?: boolean;

  @IsOptional()
  @IsBoolean()
  analytics_access?: boolean;

  @IsOptional()
  @IsBoolean()
  pdf_export?: boolean;

  @IsOptional()
  @IsBoolean()
  debt_simplification?: boolean;

  @IsOptional()
  @IsBoolean()
  custom_invite_links?: boolean;

  @IsOptional()
  @IsBoolean()
  priority_support?: boolean;

  @IsOptional()
  @IsBoolean()
  white_label?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
