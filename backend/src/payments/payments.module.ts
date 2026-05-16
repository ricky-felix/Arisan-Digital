import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, AuthGuard],
})
export class PaymentsModule {}
