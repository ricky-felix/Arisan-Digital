import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillCommentsService } from './bill-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { AuthUser } from '../common/types/schema.types';

@Controller()
@UseGuards(AuthGuard)
export class BillCommentsController {
  constructor(private readonly service: BillCommentsService) {}

  @Get('bills/:billId/comments')
  listForBill(@Param('billId') billId: string, @CurrentUser() user: AuthUser) {
    return this.service.listForBill(billId, user.id);
  }

  @Post('comments')
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id);
  }

  @Patch('comments/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete('comments/:id')
  softDelete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.softDelete(id, user.id);
  }
}
