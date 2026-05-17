import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, AuthGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
