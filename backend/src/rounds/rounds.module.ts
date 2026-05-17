import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';

@Module({
  controllers: [RoundsController],
  providers: [RoundsService, AuthGuard],
  exports: [RoundsService],
})
export class RoundsModule {}
