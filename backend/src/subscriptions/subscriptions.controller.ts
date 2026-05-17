import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { CreateGroupSubscriptionDto } from './dto/create-group-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller('subscriptions')
@UseGuards(AuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ── User subscriptions ──────────────────────────────────────────────

  /**
   * Returns the current user's active subscription joined to the plan.
   * Returns null (HTTP 200 with null body) if the user is on the free tier.
   */
  @Get('me')
  getMySubscription(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.getActiveForUser(user.id);
  }

  /**
   * Creates a new user subscription.
   * Throws 409 Conflict if the user already has an active subscription.
   */
  @Post('me')
  createMySubscription(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateUserSubscriptionDto,
  ) {
    return this.subscriptionsService.createUserSubscription(dto, user.id);
  }

  /**
   * Cancels the current user's active subscription.
   * The subscription remains accessible until current_period_end (not hard-deleted).
   */
  @Delete('me')
  cancelMySubscription(
    @CurrentUser() user: AuthUser,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancel(user.id, dto);
  }

  // ── Group subscriptions ─────────────────────────────────────────────

  /**
   * Returns the active subscription for a specific group joined to the plan.
   * Returns null if the group is on the free tier.
   */
  @Get('group/:groupId')
  getGroupSubscription(@Param('groupId') groupId: string) {
    return this.subscriptionsService.getActiveForGroup(groupId);
  }

  /**
   * Creates a new group subscription. Only the group admin may call this.
   * Throws 409 Conflict if the group already has an active subscription.
   */
  @Post('group/:groupId')
  createGroupSubscription(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateGroupSubscriptionDto,
  ) {
    // Ensure group_id in URL overrides any value in the body
    return this.subscriptionsService.createGroupSubscription(
      { ...dto, group_id: groupId },
      user.id,
    );
  }

  /**
   * Cancels the group subscription. Only the group admin may call this.
   */
  @Delete('group/:groupId')
  cancelGroupSubscription(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelGroup(groupId, user.id, dto);
  }

  // ── Admin triggers ──────────────────────────────────────────────────

  /**
   * Super-admin manual trigger to expire subscriptions past their period-end.
   * In production this is called by the nightly cron job; this endpoint
   * allows manual triggering and testing.
   */
  @Post('expire-due')
  @Roles('super_admin')
  expireDue() {
    return this.subscriptionsService.expireDue(new Date());
  }
}
