import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface DebtEdge {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  chain: string[];
}

@Injectable()
export class DebtSimplificationsService {
  constructor(private readonly supabase: SupabaseService) {}

  // ─────────────────────────────────────────────────────────────────
  // SIMPLIFY
  // ─────────────────────────────────────────────────────────────────

  /**
   * Runs the greedy min-cash-flow algorithm over a bill's splits,
   * deletes prior pending simplifications, and inserts the new edges.
   *
   * Algorithm:
   *  1. Build a net-balance map: positive = owed money (creditor), negative = owes money (debtor).
   *     For the payer: net = total_amount - payer_share (they are owed back by everyone else).
   *     For each non-payer: net = -(amount_owed).
   *  2. Repeatedly: find max creditor and max debtor, emit a transfer of min(|credit|, |debt|),
   *     reduce both balances, until all are zero.
   */
  async simplifyBill(billId: string, userId: string) {
    await this.requireBillAccess(billId, userId);

    // Load bill splits
    const { data: splits, error: sErr } = await this.supabase.admin
      .from('bill_splits')
      .select('user_id, amount_owed, is_payer')
      .eq('bill_id', billId);

    if (sErr) throw new BadRequestException(sErr.message);
    if (!splits || splits.length === 0) {
      throw new BadRequestException('No splits found for this bill');
    }

    // Compute total (for payer credit = total - payer_share)
    const total: number = (splits as Array<{ amount_owed: number }>).reduce(
      (sum, s) => sum + s.amount_owed,
      0,
    );

    // Build net balance map: positive = creditor, negative = debtor
    const balance = new Map<string, number>();
    for (const split of splits as Array<{ user_id: string; amount_owed: number; is_payer: boolean }>) {
      if (split.is_payer) {
        // Payer is owed (total - their own share)
        balance.set(split.user_id, total - split.amount_owed);
      } else {
        // Non-payer owes their share back to the payer
        balance.set(split.user_id, -(split.amount_owed));
      }
    }

    const edges = this.minCashFlow(balance);

    // Delete prior pending debt_simplifications for this bill
    await this.supabase.admin
      .from('debt_simplifications')
      .delete()
      .eq('bill_id', billId)
      .eq('status', 'pending');

    if (edges.length === 0) {
      return [];
    }

    const rows = edges.map((e) => ({
      bill_id: billId,
      from_user_id: e.from_user_id,
      to_user_id: e.to_user_id,
      amount: e.amount,
      status: 'pending',
      chain: e.chain,
    }));

    const { data: inserted, error: iErr } = await this.supabase.admin
      .from('debt_simplifications')
      .insert(rows)
      .select();

    if (iErr) throw new BadRequestException(iErr.message);
    return inserted;
  }

  // ─────────────────────────────────────────────────────────────────
  // LIST FOR BILL
  // ─────────────────────────────────────────────────────────────────

  async listForBill(billId: string, userId: string) {
    await this.requireBillAccess(billId, userId);

    const { data, error } = await this.supabase.admin
      .from('debt_simplifications')
      .select('*')
      .eq('bill_id', billId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // MARK SETTLED
  // ─────────────────────────────────────────────────────────────────

  async markSettled(id: string, userId: string) {
    const debt = await this.requireDebt(id);

    if (debt.from_user_id !== userId && debt.to_user_id !== userId) {
      throw new ForbiddenException('Only the from or to user can mark this debt as settled');
    }

    if (debt.status === 'settled') {
      throw new BadRequestException('Debt is already settled');
    }

    const { data, error } = await this.supabase.admin
      .from('debt_simplifications')
      .update({ status: 'settled', settled_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // DISMISS
  // ─────────────────────────────────────────────────────────────────

  async dismiss(id: string, userId: string) {
    const debt = await this.requireDebt(id);

    if (debt.from_user_id !== userId && debt.to_user_id !== userId) {
      throw new ForbiddenException('Only the from or to user can dismiss this debt');
    }

    if (debt.status !== 'pending') {
      throw new BadRequestException(`Cannot dismiss a debt with status '${debt.status as string}'`);
    }

    const { data, error } = await this.supabase.admin
      .from('debt_simplifications')
      .update({ status: 'dismissed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private: greedy min-cash-flow
  // ─────────────────────────────────────────────────────────────────

  /**
   * Greedy algorithm:
   * At each step, find the person with the most credit (+) and most debt (-).
   * Transfer min(credit, debt). This minimises the number of transactions.
   */
  private minCashFlow(balance: Map<string, number>): DebtEdge[] {
    const edges: DebtEdge[] = [];
    const balanceCopy = new Map(balance);

    // Filter out users with effectively zero balance (floating-point safe)
    const isZero = (v: number) => Math.abs(v) < 1;

    const maxIterations = balanceCopy.size * balanceCopy.size; // safety cap
    let iterations = 0;

    while (iterations++ < maxIterations) {
      // Find max creditor and max debtor
      let maxCredit = 0;
      let maxDebt = 0;
      let creditor = '';
      let debtor = '';

      for (const [uid, bal] of balanceCopy) {
        if (isZero(bal)) continue;
        if (bal > maxCredit) { maxCredit = bal; creditor = uid; }
        if (bal < maxDebt) { maxDebt = bal; debtor = uid; }
      }

      if (!creditor || !debtor) break; // all settled

      const transfer = Math.min(maxCredit, Math.abs(maxDebt));
      if (transfer < 1) break;

      edges.push({
        from_user_id: debtor,
        to_user_id: creditor,
        amount: Math.round(transfer),
        chain: [
          `${debtor} owes ${creditor} Rp ${Math.round(transfer).toLocaleString('id-ID')}`,
        ],
      });

      balanceCopy.set(creditor, maxCredit - transfer);
      balanceCopy.set(debtor, maxDebt + transfer);
    }

    return edges;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private async requireBillAccess(billId: string, userId: string): Promise<void> {
    const { data: bill } = await this.supabase.admin
      .from('bills')
      .select('paid_by')
      .eq('id', billId)
      .maybeSingle();

    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);
    if (bill.paid_by === userId) return;

    const { data: participant } = await this.supabase.admin
      .from('bill_participants')
      .select('id')
      .eq('bill_id', billId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this bill');
    }
  }

  private async requireDebt(id: string) {
    const { data } = await this.supabase.admin
      .from('debt_simplifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!data) throw new NotFoundException(`DebtSimplification ${id} not found`);
    return data;
  }
}
