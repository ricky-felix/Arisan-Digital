import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentTransactionsController } from './payment-transactions.controller';
import { PaymentTransactionsService } from './payment-transactions.service';

@Module({
  controllers: [PaymentTransactionsController],
  providers: [PaymentTransactionsService, AuthGuard, RolesGuard],
  exports: [PaymentTransactionsService],
})
export class PaymentTransactionsModule {}
