import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { DebtSimplificationsController } from './debt-simplifications.controller';
import { DebtSimplificationsService } from './debt-simplifications.service';

@Module({
  controllers: [DebtSimplificationsController],
  providers: [DebtSimplificationsService, AuthGuard],
  exports: [DebtSimplificationsService],
})
export class DebtSimplificationsModule {}
