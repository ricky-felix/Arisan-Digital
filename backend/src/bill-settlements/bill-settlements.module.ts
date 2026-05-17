import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillSettlementsController } from './bill-settlements.controller';
import { BillSettlementsService } from './bill-settlements.service';

@Module({
  imports: [NotificationsModule],
  controllers: [BillSettlementsController],
  providers: [BillSettlementsService, AuthGuard],
  exports: [BillSettlementsService],
})
export class BillSettlementsModule {}
