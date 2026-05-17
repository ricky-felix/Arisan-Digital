import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, AuthGuard, RolesGuard],
  /**
   * StorageService is exported so other modules can obtain signed URLs
   * programmatically (e.g. when generating a receipt download link as part of
   * a bill response).
   */
  exports: [StorageService],
})
export class StorageModule {}
