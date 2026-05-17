import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DebtSimplificationsService } from './debt-simplifications.service';
import type { AuthUser } from '../common/types/schema.types';

@Controller('debts')
@UseGuards(AuthGuard)
export class DebtSimplificationsController {
  constructor(private readonly service: DebtSimplificationsService) {}

  @Post('simplify/:billId')
  simplifyBill(@Param('billId') billId: string, @CurrentUser() user: AuthUser) {
    return this.service.simplifyBill(billId, user.id);
  }

  @Get('bill/:billId')
  listForBill(@Param('billId') billId: string, @CurrentUser() user: AuthUser) {
    return this.service.listForBill(billId, user.id);
  }

  @Patch(':id/settle')
  markSettled(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.markSettled(id, user.id);
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.dismiss(id, user.id);
  }
}
