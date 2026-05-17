import {
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class BillParticipantInput {
  @IsUUID()
  user_id: string;

  /** Used by SplitMethod='shares'. Defaults to 1. */
  @IsOptional()
  @IsInt()
  @Min(1)
  shares?: number;

  /** Used by SplitMethod='percentage'. Must be between 0.01 and 100. */
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage?: number;

  /** Used by SplitMethod='exact'. Minimum 1 IDR. */
  @IsOptional()
  @IsInt()
  @Min(1)
  exact_amount?: number;
}
