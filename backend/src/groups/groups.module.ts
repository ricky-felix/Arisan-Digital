import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, AuthGuard],
  exports: [GroupsService],
})
export class GroupsModule {}
