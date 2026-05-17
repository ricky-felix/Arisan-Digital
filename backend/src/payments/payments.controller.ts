import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/schema.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthUser) {
    return this.paymentsService.findMine(user.id);
  }

  @Get('group/:groupId')
  findForGroup(@Param('groupId') groupId: string) {
    return this.paymentsService.findForGroup(groupId);
  }

  @Get('round/:roundId')
  findForRound(@Param('roundId') roundId: string) {
    return this.paymentsService.findForRound(roundId);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthUser) {
    return this.paymentsService.create(dto, user.id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.confirm(id, user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.reject(id, dto, user.id);
  }
}
