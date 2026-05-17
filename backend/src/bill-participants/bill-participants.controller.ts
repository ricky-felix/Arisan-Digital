import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillParticipantsService } from './bill-participants.service';
import { AddParticipantDto } from './dto/add-participant.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller('bills/:billId/participants')
@UseGuards(AuthGuard)
export class BillParticipantsController {
  constructor(private readonly service: BillParticipantsService) {}

  @Post()
  addParticipant(
    @Param('billId') billId: string,
    @Body() dto: AddParticipantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addParticipant(billId, dto, user.id);
  }

  @Delete(':userId')
  removeParticipant(
    @Param('billId') billId: string,
    @Param('userId') participantUserId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.removeParticipant(billId, participantUserId, user.id);
  }
}
