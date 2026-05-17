import type { SplitMethod } from '../../common/types/schema.types';

export interface BillParticipantInput {
  user_id: string;
  /** Number of shares (used for SplitMethod='shares'). Defaults to 1. */
  shares?: number;
  /** Percentage of total (used for SplitMethod='percentage'). 0–100. */
  percentage?: number;
  /** Exact amount in IDR (used for SplitMethod='exact'). */
  exact_amount?: number;
}

export interface SplitResult {
  user_id: string;
  /** Amount this participant owes in IDR (BIGINT). For the payer this is their own share. */
  amount_owed: number;
  /** True for the person who fronted the total bill. */
  is_payer: boolean;
}

export interface SplitStrategy {
  compute(
    totalAmount: number,
    participants: BillParticipantInput[],
    payerId: string,
  ): SplitResult[];
}

// Re-export SplitMethod for convenience so callers need only import this file.
export type { SplitMethod };
