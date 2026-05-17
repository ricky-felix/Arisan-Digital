import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/schema.types';
import { AddMemberDto } from './dto/add-member.dto';
import { AssignGiliranDto } from './dto/assign-giliran.dto';
import { GroupMembersService } from './group-members.service';

@Controller('groups/:groupId/members')
@UseGuards(AuthGuard)
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Get()
  list(@Param('groupId') groupId: string) {
    return this.groupMembersService.listForGroup(groupId);
  }

  @Post()
  addMember(
    @Param('groupId') groupId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.groupMembersService.addMember(groupId, dto, user.id);
  }

  @Delete(':userId')
  removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.groupMembersService.removeMember(groupId, userId, user.id);
  }

  @Post('assign-giliran')
  assignGiliran(
    @Param('groupId') groupId: string,
    @Body() dto: AssignGiliranDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.groupMembersService.assignGiliranOrder(groupId, dto, user.id);
  }

  @Post('random-shuffle')
  randomShuffle(
    @Param('groupId') groupId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.groupMembersService.randomShuffle(groupId, user.id);
  }
}
