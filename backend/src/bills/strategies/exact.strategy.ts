import { BadRequestException } from '@nestjs/common';
import type { BillParticipantInput, SplitResult, SplitStrategy } from './split-strategy.interface';

/**
 * Each participant supplies an exact_amount.
 * The sum of all exact_amounts must equal totalAmount exactly.
 */
export class ExactSplitStrategy implements SplitStrategy {
  compute(
    totalAmount: number,
    participants: BillParticipantInput[],
    payerId: string,
  ): SplitResult[] {
    const sum = participants.reduce((acc, p) => {
      if (p.exact_amount == null) {
        throw new BadRequestException(
          `Participant ${p.user_id} is missing exact_amount for split method 'exact'`,
        );
      }
      return acc + p.exact_amount;
    }, 0);

    if (sum !== totalAmount) {
      throw new BadRequestException(
        `Sum of exact amounts (${sum}) does not equal total_amount (${totalAmount})`,
      );
    }

    return participants.map((p) => ({
      user_id: p.user_id,
      // exact_amount is validated non-null above
      amount_owed: p.exact_amount as number,
      is_payer: p.user_id === payerId,
    }));
  }
}
