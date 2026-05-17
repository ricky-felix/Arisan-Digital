import { BadRequestException } from '@nestjs/common';
import { EqualSplitStrategy } from './equal.strategy';
import { ExactSplitStrategy } from './exact.strategy';
import { PercentageSplitStrategy } from './percentage.strategy';
import { SharesSplitStrategy } from './shares.strategy';
import { getStrategy } from './split-strategy.factory';
import type { BillParticipantInput } from './split-strategy.interface';

const sumOwed = (rows: { amount_owed: number }[]) =>
  rows.reduce((acc, r) => acc + r.amount_owed, 0);

describe('EqualSplitStrategy', () => {
  const strat = new EqualSplitStrategy();

  it('divides evenly when total is divisible', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A' },
      { user_id: 'B' },
      { user_id: 'C' },
      { user_id: 'D' },
    ];
    const res = strat.compute(100_000, participants, 'A');
    expect(res.map((r) => r.amount_owed)).toEqual([25_000, 25_000, 25_000, 25_000]);
    expect(sumOwed(res)).toBe(100_000);
  });

  it('distributes rupiah remainder to first participants', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A' },
      { user_id: 'B' },
      { user_id: 'C' },
    ];
    // 100 / 3 = 33 r 1 → first gets 34, others 33
    const res = strat.compute(100, participants, 'B');
    expect(res.map((r) => r.amount_owed)).toEqual([34, 33, 33]);
    expect(sumOwed(res)).toBe(100);
  });

  it('flags the payer correctly', () => {
    const participants: BillParticipantInput[] = [{ user_id: 'A' }, { user_id: 'B' }];
    const res = strat.compute(50_000, participants, 'B');
    expect(res.find((r) => r.user_id === 'B')!.is_payer).toBe(true);
    expect(res.find((r) => r.user_id === 'A')!.is_payer).toBe(false);
  });
});

describe('ExactSplitStrategy', () => {
  const strat = new ExactSplitStrategy();

  it('returns exact amounts when sum matches total', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', exact_amount: 30_000 },
      { user_id: 'B', exact_amount: 70_000 },
    ];
    const res = strat.compute(100_000, participants, 'A');
    expect(res.map((r) => r.amount_owed)).toEqual([30_000, 70_000]);
  });

  it('throws when sum does not match total', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', exact_amount: 20_000 },
      { user_id: 'B', exact_amount: 70_000 },
    ];
    expect(() => strat.compute(100_000, participants, 'A')).toThrow(BadRequestException);
  });

  it('throws when a participant is missing exact_amount', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', exact_amount: 50_000 },
      { user_id: 'B' },
    ];
    expect(() => strat.compute(100_000, participants, 'A')).toThrow(BadRequestException);
  });
});

describe('PercentageSplitStrategy', () => {
  const strat = new PercentageSplitStrategy();

  it('computes percentages and sums to total', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', percentage: 25 },
      { user_id: 'B', percentage: 25 },
      { user_id: 'C', percentage: 50 },
    ];
    const res = strat.compute(100_000, participants, 'C');
    expect(res.map((r) => r.amount_owed)).toEqual([25_000, 25_000, 50_000]);
  });

  it('absorbs rounding drift on the last participant', () => {
    // Three thirds at 33.33% / 33.33% / 33.34% on 100 → rounding skew, last absorbs
    const participants: BillParticipantInput[] = [
      { user_id: 'A', percentage: 33.33 },
      { user_id: 'B', percentage: 33.33 },
      { user_id: 'C', percentage: 33.34 },
    ];
    const res = strat.compute(100, participants, 'A');
    expect(sumOwed(res)).toBe(100);
  });

  it('throws when percentages do not sum to 100', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', percentage: 50 },
      { user_id: 'B', percentage: 25 },
    ];
    expect(() => strat.compute(100_000, participants, 'A')).toThrow(BadRequestException);
  });

  it('throws when a participant is missing percentage', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', percentage: 50 },
      { user_id: 'B' },
    ];
    expect(() => strat.compute(100_000, participants, 'A')).toThrow(BadRequestException);
  });
});

describe('SharesSplitStrategy', () => {
  const strat = new SharesSplitStrategy();

  it('treats missing shares as 1', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A' },
      { user_id: 'B' },
    ];
    const res = strat.compute(100_000, participants, 'A');
    expect(res.map((r) => r.amount_owed)).toEqual([50_000, 50_000]);
  });

  it('divides proportionally by share count', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', shares: 1 },
      { user_id: 'B', shares: 3 },
    ];
    // 100k * 1/4 = 25k, 100k * 3/4 = 75k
    const res = strat.compute(100_000, participants, 'A');
    expect(res.map((r) => r.amount_owed)).toEqual([25_000, 75_000]);
    expect(sumOwed(res)).toBe(100_000);
  });

  it('distributes rupiah remainder to first participants', () => {
    const participants: BillParticipantInput[] = [
      { user_id: 'A', shares: 1 },
      { user_id: 'B', shares: 1 },
      { user_id: 'C', shares: 1 },
    ];
    // 100 / 3 = 33 r 1 → first gets 34
    const res = strat.compute(100, participants, 'A');
    expect(res.map((r) => r.amount_owed)).toEqual([34, 33, 33]);
    expect(sumOwed(res)).toBe(100);
  });
});

describe('getStrategy factory', () => {
  it('resolves each registered method to the right instance', () => {
    expect(getStrategy('equal')).toBeInstanceOf(EqualSplitStrategy);
    expect(getStrategy('exact')).toBeInstanceOf(ExactSplitStrategy);
    expect(getStrategy('percentage')).toBeInstanceOf(PercentageSplitStrategy);
    expect(getStrategy('shares')).toBeInstanceOf(SharesSplitStrategy);
  });

  it('throws on unknown method', () => {
    expect(() => getStrategy('mystery' as never)).toThrow(BadRequestException);
  });
});
