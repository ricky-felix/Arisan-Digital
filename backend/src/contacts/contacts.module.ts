import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, AuthGuard, RolesGuard],
  /**
   * ContactsService is exported so that other modules (e.g. BillsModule,
   * GroupMembersModule) can inject it and call `.touch()` when adding a
   * participant by phone number.
   */
  exports: [ContactsService],
})
export class ContactsModule {}
