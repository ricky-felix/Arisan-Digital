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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecurringBillsService } from './recurring-bills.service';
import { CreateRecurringBillDto } from './dto/create-recurring-bill.dto';
import { UpdateRecurringBillDto } from './dto/update-recurring-bill.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller('recurring-bills')
@UseGuards(AuthGuard)
export class RecurringBillsController {
  constructor(private readonly service: RecurringBillsService) {}

  @Post()
  create(@Body() dto: CreateRecurringBillDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id);
  }

  @Get()
  listMine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecurringBillDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.delete(id, user.id);
  }

  /**
   * Manual trigger for materializing due recurring bills.
   * Super-admin only — intended for admin console or cron job HTTP trigger.
   * The automated cron scheduler will call this via @nestjs/schedule (wired later).
   */
  @Post('run-due')
  @UseGuards(RolesGuard)
  @Roles('super_admin')
  runDue() {
    return this.service.materializeDue(new Date());
  }
}
