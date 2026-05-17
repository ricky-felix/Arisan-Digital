import type { BillParticipantInput, SplitResult, SplitStrategy } from './split-strategy.interface';

/**
 * Divides the total proportionally by share count (defaults to 1 each).
 * Remainder rupiahs are distributed to the first participants in order.
 */
export class SharesSplitStrategy implements SplitStrategy {
  compute(
    totalAmount: number,
    participants: BillParticipantInput[],
    payerId: string,
  ): SplitResult[] {
    const sharesArr = participants.map((p) => p.shares ?? 1);
    const totalShares = sharesArr.reduce((a, b) => a + b, 0);

    let distributed = 0;
    const amounts = sharesArr.map((s) => {
      const amount = Math.floor((totalAmount * s) / totalShares);
      distributed += amount;
      return amount;
    });

    // Distribute rounding remainder rupiah-by-rupiah from the front
    let remainder = totalAmount - distributed;
    for (let i = 0; remainder > 0; i++, remainder--) {
      amounts[i] += 1;
    }

    return participants.map((p, index) => ({
      user_id: p.user_id,
      amount_owed: amounts[index],
      is_payer: p.user_id === payerId,
    }));
  }
}
