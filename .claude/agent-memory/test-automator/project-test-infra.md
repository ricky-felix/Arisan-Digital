---
name: project-test-infra
description: Backend test framework, runner config, key patterns, and coverage baseline for Arisan-Digital NestJS backend
metadata:
  type: project
---

Backend unit test infrastructure for `/Users/rickyfelix/GitHub/Arisan-Digital/backend`.

**Runner:** Jest 29 + ts-jest, config in `backend/package.json` (`jest` block). `rootDir: src`, `testRegex: .*\.spec\.ts$`, node environment.

**Scripts:** `npm test`, `npm run test:watch`, `npm run test:cov` (from `backend/`).

**Supabase mock pattern:** Services use `supabase.admin.from(table).select/insert/update/delete` chains. Tests build a `from = jest.fn((table) => ({...}))` stub that returns appropriate data per table. The stub is wrapped in `{ admin: { from } } as unknown as SupabaseService`. Storage tests mock `supabase.admin.storage.from(bucket).createSignedUploadUrl/createSignedUrl/remove`. 

**Enum gotcha:** `PaymentMethodType` in `src/users/dto/create-payment-method.dto.ts` is a TypeScript enum (GOPAY/OVO/etc.), not string literals. Import the enum for use in specs. `PlanSlug` type is `'free' | 'boss' | 'business'` (not 'pro'/'premium'). 

**Baseline (2026-06-15 before expansion):** 24 test suites, 213 tests, 100% pass rate, ~3.5s execution. Overall statement coverage: 38%.

**After expansion (2026-06-15):** 49 test suites, 371 tests, 100% pass rate, ~3.3s execution. Overall statement coverage: ~70%.

**Coverage highlights after expansion (statement %):** ALL controllers 100%, billing.service 90%, midtrans/xendit webhook controllers 100%, payment-transactions.service 55%, recurring-bills.service 48%, bills.service 41% (complex service, needs more unit tests), notifications.service 30%, contacts.service 28%.

**New test files added (2026-06-15):** All 18 controller specs (bills, groups, payments, users, notifications, contacts, rounds, bill-comments, bill-participants, bill-settlements, debt-simplifications, invite-links, group-members, plans, recurring-bills, subscriptions, storage, payment-methods/controller), plus billing.service.spec, midtrans-webhook.controller.spec, xendit-webhook.controller.spec, payment-transactions.service.spec, recurring-bills.service.spec.

**Controller test pattern:** Use `Test.createTestingModule`, override `AuthGuard`/`RolesGuard` with `{ canActivate: () => true }`, use `jest.Mocked<ServiceType>` with all methods mocked as `jest.fn()`. Test pure delegation — assert service method called with correct args and result returned.

**Webhook controller test pattern:** Build module with `ConfigService` stub returning the secret key, mock `BillingService.reconcile`. Test signature validation rejection, status mapping, error-resilience (always returns `{ received: true }`).

**Remaining service coverage gaps:** bills.service (complex Supabase mock required for update/listMine paths), notifications.service (createMany/batch paths), contacts.service (update/delete/touch paths), debt-simplifications.service (settle/dismiss paths).
