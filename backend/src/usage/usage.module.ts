import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';

/**
 * UsageModule tracks per-user monthly creation counters (groups_created, bills_created).
 *
 * INTEGRATION GUIDE FOR OTHER MODULES:
 * ─────────────────────────────────────
 * After successfully inserting a group, call:
 *   await this.usageService.incrementGroups(userId);
 *
 * After successfully inserting a bill, call:
 *   await this.usageService.incrementBills(userId);
 *
 * To do this, import UsageModule and inject UsageService:
 *
 *   @Module({
 *     imports: [UsageModule],
 *     ...
 *   })
 *   export class GroupsModule {}
 *
 *   constructor(private readonly usageService: UsageService) {}
 *
 * PlanGuard reads usage_tracking directly — keeping these counters accurate
 * is critical for the limit enforcement to work correctly.
 */
@Module({
  controllers: [UsageController],
  providers: [UsageService, AuthGuard, RolesGuard],
  exports: [UsageService],
})
export class UsageModule {}
