import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, AuthGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
