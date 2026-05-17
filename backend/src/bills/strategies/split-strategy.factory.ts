import { BadRequestException } from '@nestjs/common';
import type { SplitMethod } from '../../common/types/schema.types';
import { EqualSplitStrategy } from './equal.strategy';
import { ExactSplitStrategy } from './exact.strategy';
import { PercentageSplitStrategy } from './percentage.strategy';
import { SharesSplitStrategy } from './shares.strategy';
import type { SplitStrategy } from './split-strategy.interface';

const strategyRegistry: Record<SplitMethod, SplitStrategy> = {
  equal: new EqualSplitStrategy(),
  exact: new ExactSplitStrategy(),
  percentage: new PercentageSplitStrategy(),
  shares: new SharesSplitStrategy(),
};

export function getStrategy(method: SplitMethod): SplitStrategy {
  const strategy = strategyRegistry[method];
  if (!strategy) {
    throw new BadRequestException(`Unknown split method: ${method}`);
  }
  return strategy;
}
