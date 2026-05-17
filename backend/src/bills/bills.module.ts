import { forwardRef, Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { RecurringBillsModule } from '../recurring-bills/recurring-bills.module';

@Module({
  imports: [
    NotificationsModule,
    // forwardRef prevents circular dependency with RecurringBillsModule
    forwardRef(() => RecurringBillsModule),
  ],
  controllers: [BillsController],
  providers: [BillsService, AuthGuard],
  exports: [BillsService],
})
export class BillsModule {}
