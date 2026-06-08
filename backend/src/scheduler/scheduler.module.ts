import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecurringBillsModule } from '../recurring-bills/recurring-bills.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [RecurringBillsModule, SubscriptionsModule, NotificationsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
