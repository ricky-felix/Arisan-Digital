import {
  Body,
  Controller,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/schema.types';
import { StorageService } from './storage.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { CreateReadUrlDto } from './dto/create-read-url.dto';
import { DeleteObjectDto } from './dto/delete-object.dto';

@Controller('storage')
@UseGuards(AuthGuard, RolesGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * POST /storage/upload-url
   * Issues a signed upload URL so the frontend can upload directly to Supabase
   * Storage without proxying the file through the backend.
   *
   * Response: { bucket, path, signed_url, token }
   */
  @Post('upload-url')
  createUploadUrl(
    @Body() dto: CreateUploadUrlDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.storageService.createUploadUrl(dto, user.id);
  }

  /**
   * POST /storage/read-url
   * Issues a signed read URL for a private storage object.
   *
   * Ownership: the path must belong to the requesting user
   * (`path.startsWith(userId + '/')`). super_admin can read any path.
   *
   * Response: { signed_url, expires_at }
   */
  @Post('read-url')
  createReadUrl(
    @Body() dto: CreateReadUrlDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isSuperAdmin = user.platform_role === 'super_admin';
    return this.storageService.createReadUrl(dto, user.id, isSuperAdmin);
  }

  /**
   * DELETE /storage/object
   * Deletes a storage object. Body: { bucket, path }.
   *
   * Ownership: the path must belong to the requesting user.
   * super_admin can delete any path.
   */
  @Delete('object')
  deleteObject(
    @Body() dto: DeleteObjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isSuperAdmin = user.platform_role === 'super_admin';
    return this.storageService.delete(dto.bucket, dto.path, user.id, isSuperAdmin);
  }
}
