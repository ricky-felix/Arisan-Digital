import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { PLAN_RESOURCE_KEY, PlanResource } from '../common/guards/plan.guard';
import { UsageService } from './usage.service';
import type { AuthUser } from '../common/types/schema.types';

/**
 * UsageInterceptor — opt-in automatic usage counter increment.
 *
 * Apply this interceptor to any controller handler decorated with
 * @RequirePlan('groups') or @RequirePlan('bills') to automatically increment
 * the corresponding counter after a 2xx response.
 *
 * Usage (opt-in per handler or per controller):
 *
 *   @UseInterceptors(UsageInterceptor)
 *   @RequirePlan('groups')
 *   @Post()
 *   create(...) { ... }
 *
 * This is an alternative to manually calling UsageService.incrementGroups/
 * incrementBills from within the service layer. Both approaches are valid.
 * Prefer the service-layer approach for transactional safety (if the DB insert
 * fails after the increment, you'd need to roll back the counter).
 *
 * The interceptor only increments on HTTP 2xx responses. Errors thrown by
 * the service will propagate normally without touching usage counters.
 */
@Injectable()
export class UsageInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UsageInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly usageService: UsageService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const resource = this.reflector.getAllAndOverride<PlanResource | undefined>(
      PLAN_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @RequirePlan decorator is present, pass through unchanged
    if (!resource) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;

    return next.handle().pipe(
      tap(() => {
        if (!user) return;
        // Fire-and-forget: don't block the response
        const increment =
          resource === 'groups'
            ? this.usageService.incrementGroups(user.id)
            : this.usageService.incrementBills(user.id);

        increment.catch((err: unknown) => {
          // Log but don't crash — the resource was already created successfully
          this.logger.error(
            `Failed to increment ${resource} usage for user ${user.id}: ${String(err)}`,
          );
        });
      }),
    );
  }
}
