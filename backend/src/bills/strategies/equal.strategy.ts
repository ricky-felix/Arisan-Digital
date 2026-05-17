import type { BillParticipantInput, SplitResult, SplitStrategy } from './split-strategy.interface';

/**
 * Divides total equally among N participants.
 * Handles rounding by distributing the remainder rupiah-by-rupiah
 * to the first participants in order.
 */
export class EqualSplitStrategy implements SplitStrategy {
  compute(
    totalAmount: number,
    participants: BillParticipantInput[],
    payerId: string,
  ): SplitResult[] {
    const n = participants.length;
    const base = Math.floor(totalAmount / n);
    const remainder = totalAmount - base * n;

    return participants.map((p, index) => ({
      user_id: p.user_id,
      amount_owed: index < remainder ? base + 1 : base,
      is_payer: p.user_id === payerId,
    }));
  }
}
