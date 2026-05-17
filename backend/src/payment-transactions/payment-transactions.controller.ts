import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentTransactionsService } from './payment-transactions.service';
import type { AuthUser, Gateway, TransactionStatus, TransactionType } from '../common/types/schema.types';

@Controller('transactions')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentTransactionsController {
  constructor(
    private readonly txService: PaymentTransactionsService,
  ) {}

  /**
   * Returns the authenticated user's own transaction history, newest first.
   */
  @Get('me')
  listMine(@CurrentUser() user: AuthUser) {
    return this.txService.listMine(user.id);
  }

  /**
   * Super-admin only: lists all transactions across all users.
   * Supports optional query filters: status, gateway, type, limit, offset.
   */
  @Get()
  @Roles('super_admin')
  listAll(
    @Query('status') status?: TransactionStatus,
    @Query('gateway') gateway?: Gateway,
    @Query('type') type?: TransactionType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.txService.listAll({
      status,
      gateway,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
