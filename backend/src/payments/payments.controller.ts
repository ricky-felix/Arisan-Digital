import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('me')
  myPayments(@Req() req: any) {
    return this.paymentsService.findForUser(req.user.id);
  }

  @Get('group/:groupId')
  groupPayments(@Param('groupId') groupId: string) {
    return this.paymentsService.findForGroup(groupId);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(dto, req.user.id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.paymentsService.confirm(id);
  }
}
