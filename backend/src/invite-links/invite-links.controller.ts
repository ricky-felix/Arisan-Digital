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
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteLinksService } from './invite-links.service';

@Controller('invites')
@UseGuards(AuthGuard)
export class InviteLinksController {
  constructor(private readonly inviteLinksService: InviteLinksService) {}

  @Post()
  create(@Body() dto: CreateInviteDto, @CurrentUser() user: AuthUser) {
    return this.inviteLinksService.create(dto, user.id);
  }

  @Get('group/:groupId')
  listForGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inviteLinksService.listForGroup(groupId, user.id);
  }

  @Patch(':id/revoke')
  revoke(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.inviteLinksService.revoke(id, user.id);
  }

  @Post('redeem/:token')
  redeem(@Param('token') token: string, @CurrentUser() user: AuthUser) {
    return this.inviteLinksService.redeem(token, user.id);
  }
}
