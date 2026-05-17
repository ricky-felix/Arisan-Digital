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
import { BillSettlementsService } from './bill-settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { RejectSettlementDto } from './dto/reject-settlement.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller('settlements')
@UseGuards(AuthGuard)
export class BillSettlementsController {
  constructor(private readonly service: BillSettlementsService) {}

  @Post()
  create(@Body() dto: CreateSettlementDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.confirm(id, user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectSettlementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reject(id, dto, user.id);
  }

  @Get('bill/:billId')
  listForBill(@Param('billId') billId: string, @CurrentUser() user: AuthUser) {
    return this.service.listForBill(billId, user.id);
  }

  @Get('me')
  listMine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user.id);
  }
}
