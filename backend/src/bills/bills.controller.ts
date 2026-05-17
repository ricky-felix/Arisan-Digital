import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePlan } from '../common/guards/plan.guard';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller('bills')
@UseGuards(AuthGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @RequirePlan('bills')
  create(@Body() dto: CreateBillDto, @CurrentUser() user: AuthUser) {
    return this.billsService.create(dto, user.id);
  }

  @Get()
  listMine(@CurrentUser() user: AuthUser) {
    return this.billsService.listMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.billsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBillDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.billsService.update(id, dto, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.billsService.delete(id, user.id);
  }

  @Patch(':id/settle')
  markSettled(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.billsService.markSettled(id, user.id);
  }
}
