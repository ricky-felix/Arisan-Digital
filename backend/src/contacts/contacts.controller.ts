import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/schema.types';
import { ContactsService, ContactSortOption } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { TouchContactDto } from './dto/touch-contact.dto';

@Controller('contacts')
@UseGuards(AuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * GET /contacts
   * Lists the authenticated user's contacts.
   *
   * Query params:
   *   sort  — 'recent' | 'frequent' | 'name'  (default: 'recent')
   *   limit — positive integer                  (default: 50)
   */
  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
  ) {
    const VALID_SORTS: ContactSortOption[] = ['recent', 'frequent', 'name'];
    const resolvedSort =
      sort && VALID_SORTS.includes(sort as ContactSortOption)
        ? (sort as ContactSortOption)
        : 'recent';

    const resolvedLimit = limit ? parseInt(limit, 10) : undefined;
    if (resolvedLimit !== undefined && (isNaN(resolvedLimit) || resolvedLimit < 1)) {
      throw new BadRequestException('limit must be a positive integer');
    }

    return this.contactsService.listMine(user.id, {
      sort: resolvedSort,
      limit: resolvedLimit,
    });
  }

  /**
   * GET /contacts/recents
   * Returns the 10 most recently used contacts.
   *
   * NOTE: This route must be declared BEFORE `:id` so Express does not
   * incorrectly treat "recents" as a UUID parameter.
   */
  @Get('recents')
  recents(@CurrentUser() user: AuthUser) {
    return this.contactsService.recents(user.id);
  }

  /**
   * POST /contacts
   * Creates a new contact. Upserts on (owner_id, phone) — safe to retry.
   */
  @Post()
  create(@Body() dto: CreateContactDto, @CurrentUser() user: AuthUser) {
    return this.contactsService.create(dto, user.id);
  }

  /**
   * POST /contacts/touch
   * Manually bumps use_count and refreshes last_used_at for a contact.
   * Body: { phone? } | { contact_id? }  (one required)
   */
  @Post('touch')
  touch(@Body() dto: TouchContactDto, @CurrentUser() user: AuthUser) {
    const identifier = dto.phone ?? dto.contact_id;
    if (!identifier) {
      throw new BadRequestException(
        'Provide either phone or contact_id in the request body',
      );
    }
    return this.contactsService.touch(user.id, identifier);
  }

  /**
   * PATCH /contacts/:id
   * Updates a contact owned by the authenticated user.
   */
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.contactsService.update(id, dto, user.id);
  }

  /**
   * DELETE /contacts/:id
   * Deletes a contact owned by the authenticated user.
   */
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.contactsService.delete(id, user.id);
  }
}
