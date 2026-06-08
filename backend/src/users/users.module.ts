import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  controllers: [UsersController, PaymentMethodsController],
  providers: [UsersService, AuthGuard, RolesGuard, PaymentMethodsService],
  exports: [UsersService, PaymentMethodsService],
})
export class UsersModule {}
