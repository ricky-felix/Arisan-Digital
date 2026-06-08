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

**Baseline after June 2026 additions:** 24 test suites, 213 tests, 100% pass rate, ~3.5s execution.

**Coverage baseline (statement %):** bills.service 41%, bill-settlements 73%, bill-participants 90%, bill-comments 94%, group-members 89%, invite-links 81%, rounds 82%, payments 71%, users.service 55%, payment-methods 68%, notifications 30%, storage 100%, scheduler 100%, plans 38%, subscriptions 61%, usage 97%.

**Untested services (skipped):** `billing.service.ts` (0% — webhook orchestration with midtrans/xendit; needs gateway-specific mocks), `payment-transactions.service.ts` (9% — straightforward CRUD but not prioritized), `recurring-bills.service.ts` (7% — materializeDue integration with BillsService via forwardRef makes isolated unit testing complex).

**Why:** `billing.service.ts` depends on midtrans/xendit signature verification that requires real gateway request shapes to mock meaningfully; deferred to integration test layer.
