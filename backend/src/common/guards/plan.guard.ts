import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { AuthUser } from '../types/schema.types';

export type PlanResource = 'groups' | 'bills';
export const PLAN_RESOURCE_KEY = 'plan_resource';

// Annotate a controller handler with the resource being created so PlanGuard
// can enforce the right limit (groups_created vs bills_created).
export const RequirePlan = (resource: PlanResource) =>
  SetMetadata(PLAN_RESOURCE_KEY, resource);

interface PlanRow {
  max_groups: number | null;
  max_members_per_group: number | null;
  max_bills_per_month: number | null;
  slug: string;
}

const FREE_FALLBACK: PlanRow = {
  slug: 'free',
  max_groups: 2,
  max_members_per_group: 10,
  max_bills_per_month: 5,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<PlanResource | undefined>(
      PLAN_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!resource) return true;

    const user: AuthUser | undefined = context.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Authenticated user not found');

    const plan = await this.resolveActivePlan(user.id);

    // Plans with NULL limits are unlimited
    const limit =
      resource === 'groups' ? plan.max_groups : plan.max_bills_per_month;
    if (limit == null) return true;

    const periodMonth = this.currentPeriodMonth();
    const { data: usage } = await this.supabase.admin
      .from('usage_tracking')
      .select('groups_created, bills_created')
      .eq('user_id', user.id)
      .eq('period_month', periodMonth)
      .maybeSingle();

    const used =
      resource === 'groups'
        ? (usage?.groups_created ?? 0)
        : (usage?.bills_created ?? 0);

    if (used >= limit) {
      throw new ForbiddenException(
        `Plan limit reached for ${resource} (${used}/${limit}). Upgrade to continue.`,
      );
    }

    return true;
  }

  private async resolveActivePlan(userId: string): Promise<PlanRow> {
    const { data } = await this.supabase.admin
      .from('user_subscriptions')
      .select('plans (slug, max_groups, max_members_per_group, max_bills_per_month)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    // supabase-js types joined rows as an array even when the FK is one-to-one
    const joined = (data as { plans?: PlanRow | PlanRow[] } | null)?.plans;
    const plan = Array.isArray(joined) ? joined[0] : joined;
    if (plan) return plan;

    const { data: freePlan } = await this.supabase.admin
      .from('plans')
      .select('slug, max_groups, max_members_per_group, max_bills_per_month')
      .eq('slug', 'free')
      .maybeSingle();

    return (freePlan as PlanRow) ?? FREE_FALLBACK;
  }

  private currentPeriodMonth(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
  }
}
