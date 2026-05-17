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
import { PlansService } from './plans.service';
import { UpsertPlanDto } from './dto/upsert-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * Public — no auth required. Used on the pricing page.
   * Returns all active plans ordered by price ascending.
   */
  @Get()
  listActive() {
    return this.plansService.listActive();
  }

  /**
   * Public — no auth required. Returns a single plan including inactive ones
   * (admin UI may call this to view deactivated plans).
   */
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.plansService.getBySlug(slug);
  }

  /**
   * Super-admin only: create a new plan.
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('super_admin')
  create(@Body() dto: UpsertPlanDto) {
    return this.plansService.create(dto);
  }

  /**
   * Super-admin only: partially update an existing plan by slug.
   */
  @Patch(':slug')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('super_admin')
  update(@Param('slug') slug: string, @Body() dto: UpsertPlanDto) {
    return this.plansService.update(slug, dto);
  }

  /**
   * Super-admin only: soft-deactivate a plan (sets is_active=false).
   * Plans are NEVER hard-deleted — they remain for historical billing reference.
   */
  @Delete(':slug')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('super_admin')
  deactivate(@Param('slug') slug: string) {
    return this.plansService.deactivate(slug);
  }
}
