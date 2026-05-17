import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsageService } from './usage.service';
import type { AuthUser } from '../common/types/schema.types';

@Controller('usage')
@UseGuards(AuthGuard, RolesGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  /**
   * Returns the current month's usage row for the authenticated user.
   * Creates a zero row if one doesn't exist yet.
   */
  @Get('me')
  getCurrent(@CurrentUser() user: AuthUser) {
    return this.usageService.getCurrent(user.id);
  }

  /**
   * Increments the groups_created counter for the authenticated user.
   *
   * NOTE: In normal application flow this counter is incremented server-side
   * by GroupsService after a successful group insert — not by the client.
   * This endpoint exists for internal testing and administrative corrections.
   * The groups/bills services should inject UsageService and call
   * incrementGroups(userId) / incrementBills(userId) directly after creation.
   */
  @Post('me/groups/increment')
  incrementGroups(@CurrentUser() user: AuthUser) {
    return this.usageService.incrementGroups(user.id).then(() => ({
      message: 'groups_created incremented',
    }));
  }

  /**
   * Increments the bills_created counter for the authenticated user.
   *
   * NOTE: Same as above — BillsService should call UsageService.incrementBills
   * directly after inserting a bill row, not via this HTTP endpoint.
   * This endpoint is for testing and manual corrections only.
   */
  @Post('me/bills/increment')
  incrementBills(@CurrentUser() user: AuthUser) {
    return this.usageService.incrementBills(user.id).then(() => ({
      message: 'bills_created incremented',
    }));
  }
}
