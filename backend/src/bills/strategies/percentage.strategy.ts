import { BadRequestException } from '@nestjs/common';
import type { BillParticipantInput, SplitResult, SplitStrategy } from './split-strategy.interface';

/**
 * Each participant supplies a percentage (0–100).
 * Percentages must sum to exactly 100.
 * Amount = round(totalAmount * percentage / 100).
 * Rounding errors are resolved by adjusting the last participant's share.
 */
export class PercentageSplitStrategy implements SplitStrategy {
  compute(
    totalAmount: number,
    participants: BillParticipantInput[],
    payerId: string,
  ): SplitResult[] {
    const totalPct = participants.reduce((acc, p) => {
      if (p.percentage == null) {
        throw new BadRequestException(
          `Participant ${p.user_id} is missing percentage for split method 'percentage'`,
        );
      }
      return acc + p.percentage;
    }, 0);

    // Allow a tiny floating-point tolerance before comparing to 100
    if (Math.abs(totalPct - 100) > 0.01) {
      throw new BadRequestException(
        `Percentages must sum to 100 (got ${totalPct})`,
      );
    }

    const results: SplitResult[] = participants.map((p) => ({
      user_id: p.user_id,
      amount_owed: Math.round(totalAmount * (p.percentage as number) / 100),
      is_payer: p.user_id === payerId,
    }));

    // Correct rounding drift on the last participant
    const computed = results.reduce((acc, r) => acc + r.amount_owed, 0);
    const diff = totalAmount - computed;
    if (diff !== 0) {
      results[results.length - 1].amount_owed += diff;
    }

    return results;
  }
}
