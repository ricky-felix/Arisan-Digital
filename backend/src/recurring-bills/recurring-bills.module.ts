import { forwardRef, Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BillsModule } from '../bills/bills.module';
import { RecurringBillsController } from './recurring-bills.controller';
import { RecurringBillsService } from './recurring-bills.service';

@Module({
  imports: [
    // forwardRef resolves the circular dependency: BillsModule ↔ RecurringBillsModule
    forwardRef(() => BillsModule),
  ],
  controllers: [RecurringBillsController],
  providers: [RecurringBillsService, AuthGuard, RolesGuard],
  exports: [RecurringBillsService],
})
export class RecurringBillsModule {}
