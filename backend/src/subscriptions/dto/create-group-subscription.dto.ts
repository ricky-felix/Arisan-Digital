import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import type { BillingCycle, Gateway, PlanSlug } from '../../common/types/schema.types';

export class CreateGroupSubscriptionDto {
  @IsUUID()
  group_id: string;

  @IsEnum(['free', 'boss', 'business'] as const)
  plan_slug: PlanSlug;

  @IsEnum(['monthly', 'yearly'] as const)
  billing_cycle: BillingCycle;

  @IsOptional()
  @IsEnum(['xendit', 'midtrans', 'manual'] as const)
  gateway?: Gateway;

  /** External payment reference from the gateway (invoice ID, etc.) */
  @IsOptional()
  @IsString()
  payment_ref?: string;
}
