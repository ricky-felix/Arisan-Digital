import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { InviteLinksController } from './invite-links.controller';
import { InviteLinksService } from './invite-links.service';

@Module({
  controllers: [InviteLinksController],
  providers: [InviteLinksService, AuthGuard],
  exports: [InviteLinksService],
})
export class InviteLinksModule {}
