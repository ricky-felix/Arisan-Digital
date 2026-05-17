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
import { SetRecipientDto } from './dto/set-recipient.dto';
import { RoundsService } from './rounds.service';

@Controller()
@UseGuards(AuthGuard)
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  // GET /groups/:groupId/rounds
  @Get('groups/:groupId/rounds')
  listForGroup(@Param('groupId') groupId: string) {
    return this.roundsService.listForGroup(groupId);
  }

  // GET /rounds/:id
  @Get('rounds/:id')
  findOne(@Param('id') id: string) {
    return this.roundsService.findOne(id);
  }

  // PATCH /rounds/:id/recipient
  @Patch('rounds/:id/recipient')
  setRecipient(
    @Param('id') id: string,
    @Body() dto: SetRecipientDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.roundsService.setRecipient(id, dto.recipient_id, user.id);
  }

  // POST /rounds/:id/activate
  @Post('rounds/:id/activate')
  activate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.roundsService.activate(id, user.id);
  }

  // POST /rounds/:id/complete
  @Post('rounds/:id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.roundsService.complete(id, user.id);
  }
}
