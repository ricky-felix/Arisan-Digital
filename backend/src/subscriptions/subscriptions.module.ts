import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentTransactionsModule } from '../payment-transactions/payment-transactions.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [PaymentTransactionsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, AuthGuard, RolesGuard],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
