import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanGuard, PLAN_RESOURCE_KEY, PlanResource } from './plan.guard';
import { SupabaseService } from '../../supabase/supabase.service';
import type { AuthUser } from '../types/schema.types';

function makeContext(user: AuthUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

// Minimal chain-mock: parameterise the result returned for each table.
function buildSupabase(opts: {
  subRow?: unknown;
  freeRow?: unknown;
  usageRow?: unknown;
}): SupabaseService {
  const from = jest.fn((table: string) => {
    if (table === 'user_subscriptions') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: opts.subRow ?? null }),
            }),
          }),
        }),
      };
    }
    if (table === 'plans') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: opts.freeRow ?? null }),
          }),
        }),
      };
    }
    if (table === 'usage_tracking') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: opts.usageRow ?? null }),
            }),
          }),
        }),
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });
  return { admin: { from } } as unknown as SupabaseService;
}

function makeReflector(resource: PlanResource | undefined): Reflector {
  return {
    getAllAndOverride: jest.fn((key: string) => {
      if (key === PLAN_RESOURCE_KEY) return resource;
      return undefined;
    }),
  } as unknown as Reflector;
}

const USER: AuthUser = { id: 'u-1', platform_role: 'user' };

describe('PlanGuard', () => {
  it('passes when no @RequirePlan metadata is set', async () => {
    const guard = new PlanGuard(makeReflector(undefined), buildSupabase({}));
    await expect(guard.canActivate(makeContext(USER))).resolves.toBe(true);
  });

  it('rejects when no authenticated user is present', async () => {
    const guard = new PlanGuard(makeReflector('groups'), buildSupabase({}));
    await expect(guard.canActivate(makeContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('uses free fallback (max 2 groups) when user has no subscription', async () => {
    const guard = new PlanGuard(
      makeReflector('groups'),
      buildSupabase({
        freeRow: {
          slug: 'free',
          max_groups: 2,
          max_members_per_group: 10,
          max_bills_per_month: 5,
        },
        usageRow: { groups_created: 2, bills_created: 0 },
      }),
    );
    await expect(guard.canActivate(makeContext(USER))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows when free user is under the groups limit', async () => {
    const guard = new PlanGuard(
      makeReflector('groups'),
      buildSupabase({
        freeRow: {
          slug: 'free',
          max_groups: 2,
          max_members_per_group: 10,
          max_bills_per_month: 5,
        },
        usageRow: { groups_created: 1, bills_created: 0 },
      }),
    );
    await expect(guard.canActivate(makeContext(USER))).resolves.toBe(true);
  });

  it('passes when subscription plan has null (unlimited) limit', async () => {
    // supabase joins one-to-one but types as an array — guard must handle both
    const guard = new PlanGuard(
      makeReflector('bills'),
      buildSupabase({
        subRow: {
          plans: [
            {
              slug: 'boss',
              max_groups: null,
              max_members_per_group: null,
              max_bills_per_month: null,
            },
          ],
        },
        usageRow: { groups_created: 99, bills_created: 999 },
      }),
    );
    await expect(guard.canActivate(makeContext(USER))).resolves.toBe(true);
  });

  it('handles joined plan returned as a single object (not array)', async () => {
    const guard = new PlanGuard(
      makeReflector('bills'),
      buildSupabase({
        subRow: {
          plans: {
            slug: 'boss',
            max_groups: null,
            max_members_per_group: null,
            max_bills_per_month: null,
          },
        },
        usageRow: { groups_created: 0, bills_created: 0 },
      }),
    );
    await expect(guard.canActivate(makeContext(USER))).resolves.toBe(true);
  });

  it('treats a missing usage row as zero usage', async () => {
    const guard = new PlanGuard(
      makeReflector('bills'),
      buildSupabase({
        freeRow: {
          slug: 'free',
          max_groups: 2,
          max_members_per_group: 10,
          max_bills_per_month: 5,
        },
        usageRow: null,
      }),
    );
    await expect(guard.canActivate(makeContext(USER))).resolves.toBe(true);
  });
});
