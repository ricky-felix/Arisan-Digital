import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { RecurringBillsService } from '../recurring-bills/recurring-bills.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly recurringBillsService: RecurringBillsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Materializes recurring bills whose next_due_date <= today.
   * Runs daily at 06:00 server time (override via CRON_MATERIALIZE_BILLS env var).
   */
  @Cron(process.env.CRON_MATERIALIZE_BILLS ?? CronExpression.EVERY_DAY_AT_6AM, {
    name: 'materialize-recurring-bills',
  })
  async materializeRecurringBills(): Promise<void> {
    this.logger.log('Starting: materialize due recurring bills');
    try {
      const result = await this.recurringBillsService.materializeDue(new Date());
      this.logger.log(`Completed: materialize recurring bills — created=${result.created}`);
    } catch (err) {
      this.logger.error('Failed: materialize recurring bills', (err as Error).stack);
    }
  }

  /**
   * Expires user and group subscriptions past their current_period_end.
   * Runs daily at 06:15 server time (override via CRON_EXPIRE_SUBSCRIPTIONS env var).
   */
  @Cron(process.env.CRON_EXPIRE_SUBSCRIPTIONS ?? '15 6 * * *', {
    name: 'expire-due-subscriptions',
  })
  async expireDueSubscriptions(): Promise<void> {
    this.logger.log('Starting: expire due subscriptions');
    try {
      const result = await this.subscriptionsService.expireDue(new Date());
      this.logger.log(
        `Completed: expire due subscriptions — expired_count=${result.expired_count}`,
      );
    } catch (err) {
      this.logger.error('Failed: expire due subscriptions', (err as Error).stack);
    }
  }

  /**
   * Sends payment reminders for upcoming/overdue Arisan rounds and pending
   * Patungan bill settlements.
   * Runs daily at 08:00 server time (override via CRON_PAYMENT_REMINDERS env var).
   */
  @Cron(process.env.CRON_PAYMENT_REMINDERS ?? '0 8 * * *', {
    name: 'send-payment-reminders',
  })
  async sendPaymentReminders(): Promise<void> {
    this.logger.log('Starting: send payment reminders');
    try {
      const result = await this.notificationsService.createPaymentReminders(new Date());
      this.logger.log(`Completed: send payment reminders — created=${result.created}`);
    } catch (err) {
      this.logger.error('Failed: send payment reminders', (err as Error).stack);
    }
  }
}
