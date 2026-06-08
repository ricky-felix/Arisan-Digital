import { SchedulerService } from './scheduler.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecurringBillsService } from '../recurring-bills/recurring-bills.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

// ─── Mock dependencies ────────────────────────────────────────────────────────

function makeRecurring(result: { created: number } | Error): jest.Mocked<Pick<RecurringBillsService, 'materializeDue'>> {
  return {
    materializeDue: jest.fn().mockImplementation(() =>
      result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
    ),
  };
}

function makeSubscriptions(result: { expired_count: number } | Error): jest.Mocked<Pick<SubscriptionsService, 'expireDue'>> {
  return {
    expireDue: jest.fn().mockImplementation(() =>
      result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
    ),
  };
}

function makeNotifications(result: { created: number } | Error): jest.Mocked<Pick<NotificationsService, 'createPaymentReminders'>> {
  return {
    createPaymentReminders: jest.fn().mockImplementation(() =>
      result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
    ),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SchedulerService.materializeRecurringBills', () => {
  it('calls recurringBillsService.materializeDue with a Date', async () => {
    const recurring = makeRecurring({ created: 3 });
    const svc = new SchedulerService(
      recurring as unknown as RecurringBillsService,
      makeSubscriptions({ expired_count: 0 }) as unknown as SubscriptionsService,
      makeNotifications({ created: 0 }) as unknown as NotificationsService,
    );
    await svc.materializeRecurringBills();
    expect(recurring.materializeDue).toHaveBeenCalledWith(expect.any(Date));
  });

  it('does NOT throw when materializeDue rejects (error is swallowed)', async () => {
    const recurring = makeRecurring(new Error('DB down'));
    const svc = new SchedulerService(
      recurring as unknown as RecurringBillsService,
      makeSubscriptions({ expired_count: 0 }) as unknown as SubscriptionsService,
      makeNotifications({ created: 0 }) as unknown as NotificationsService,
    );
    await expect(svc.materializeRecurringBills()).resolves.toBeUndefined();
  });
});

describe('SchedulerService.expireDueSubscriptions', () => {
  it('calls subscriptionsService.expireDue with a Date', async () => {
    const subs = makeSubscriptions({ expired_count: 2 });
    const svc = new SchedulerService(
      makeRecurring({ created: 0 }) as unknown as RecurringBillsService,
      subs as unknown as SubscriptionsService,
      makeNotifications({ created: 0 }) as unknown as NotificationsService,
    );
    await svc.expireDueSubscriptions();
    expect(subs.expireDue).toHaveBeenCalledWith(expect.any(Date));
  });

  it('does NOT throw when expireDue rejects', async () => {
    const subs = makeSubscriptions(new Error('timeout'));
    const svc = new SchedulerService(
      makeRecurring({ created: 0 }) as unknown as RecurringBillsService,
      subs as unknown as SubscriptionsService,
      makeNotifications({ created: 0 }) as unknown as NotificationsService,
    );
    await expect(svc.expireDueSubscriptions()).resolves.toBeUndefined();
  });
});

describe('SchedulerService.sendPaymentReminders', () => {
  it('calls notificationsService.createPaymentReminders with a Date', async () => {
    const notif = makeNotifications({ created: 5 });
    const svc = new SchedulerService(
      makeRecurring({ created: 0 }) as unknown as RecurringBillsService,
      makeSubscriptions({ expired_count: 0 }) as unknown as SubscriptionsService,
      notif as unknown as NotificationsService,
    );
    await svc.sendPaymentReminders();
    expect(notif.createPaymentReminders).toHaveBeenCalledWith(expect.any(Date));
  });

  it('does NOT throw when createPaymentReminders rejects', async () => {
    const notif = makeNotifications(new Error('rate limited'));
    const svc = new SchedulerService(
      makeRecurring({ created: 0 }) as unknown as RecurringBillsService,
      makeSubscriptions({ expired_count: 0 }) as unknown as SubscriptionsService,
      notif as unknown as NotificationsService,
    );
    await expect(svc.sendPaymentReminders()).resolves.toBeUndefined();
  });
});
