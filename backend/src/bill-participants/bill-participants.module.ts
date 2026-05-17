import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { BillParticipantsController } from './bill-participants.controller';
import { BillParticipantsService } from './bill-participants.service';

@Module({
  controllers: [BillParticipantsController],
  providers: [BillParticipantsService, AuthGuard],
  exports: [BillParticipantsService],
})
export class BillParticipantsModule {}
