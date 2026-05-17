import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { BillCommentsController } from './bill-comments.controller';
import { BillCommentsService } from './bill-comments.service';

@Module({
  controllers: [BillCommentsController],
  providers: [BillCommentsService, AuthGuard],
  exports: [BillCommentsService],
})
export class BillCommentsModule {}
