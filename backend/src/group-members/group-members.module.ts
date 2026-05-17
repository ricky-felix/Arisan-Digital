import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { GroupMembersController } from './group-members.controller';
import { GroupMembersService } from './group-members.service';

@Module({
  controllers: [GroupMembersController],
  providers: [GroupMembersService, AuthGuard],
  exports: [GroupMembersService],
})
export class GroupMembersModule {}
