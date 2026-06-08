import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SupabaseModule } from './supabase/supabase.module';

// ── Identity & auth ──────────────────────────────────────────────
import { UsersModule } from './users/users.module';

// ── Arisan core ──────────────────────────────────────────────────
import { GroupsModule } from './groups/groups.module';
import { GroupMembersModule } from './group-members/group-members.module';
import { RoundsModule } from './rounds/rounds.module';
import { PaymentsModule } from './payments/payments.module';
import { InviteLinksModule } from './invite-links/invite-links.module';
import { NotificationsModule } from './notifications/notifications.module';

// ── Patungan (bill splitting) ────────────────────────────────────
import { BillsModule } from './bills/bills.module';
import { BillParticipantsModule } from './bill-participants/bill-participants.module';
import { BillSettlementsModule } from './bill-settlements/bill-settlements.module';
import { BillCommentsModule } from './bill-comments/bill-comments.module';
import { RecurringBillsModule } from './recurring-bills/recurring-bills.module';
import { DebtSimplificationsModule } from './debt-simplifications/debt-simplifications.module';

// ── Monetization ─────────────────────────────────────────────────
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentTransactionsModule } from './payment-transactions/payment-transactions.module';
import { BillingModule } from './billing/billing.module';
import { UsageModule } from './usage/usage.module';

// ── Cross-cutting ────────────────────────────────────────────────
import { ContactsModule } from './contacts/contacts.module';
import { StorageModule } from './storage/storage.module';

// ── Scheduler ────────────────────────────────────────────────────
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SupabaseModule,

    UsersModule,

    GroupsModule,
    GroupMembersModule,
    RoundsModule,
    PaymentsModule,
    InviteLinksModule,
    NotificationsModule,

    BillsModule,
    BillParticipantsModule,
    BillSettlementsModule,
    BillCommentsModule,
    RecurringBillsModule,
    DebtSimplificationsModule,

    PlansModule,
    SubscriptionsModule,
    PaymentTransactionsModule,
    BillingModule,
    UsageModule,

    ContactsModule,
    StorageModule,

    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
