---
name: project-e2e-setup
description: E2E test infrastructure for the NestJS backend — framework, config, mock strategy, and how to run
metadata:
  type: project
---

E2E test suite added to `backend/test/` using supertest against an in-memory Nest app.

**How to run:**
- `npm run test:e2e` (from `backend/`) — runs e2e suite
- `npm test` — runs unit suite (unaffected)

**Config:** `backend/test/jest-e2e.json` — rootDir `..`, testRegex `.e2e-spec.ts$`, ts-jest transform.

**Mock strategy:** `SupabaseService` is overridden via `Test.createTestingModule().overrideProvider()` in `backend/test/helpers/app.helper.ts`. The mock's `verifyToken` resolves for `VALID_TOKEN`/`ADMIN_TOKEN` and rejects otherwise. The `admin` chainable builder returns `{ data: null, error: null }` for all queries. ConfigModule env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are set as dummy values before module init via `process.env`.

**Coverage (88 tests across 9 suites):** groups, bills, bill-participants, bill-settlements, payments, users, notifications, invite-links, plans/subscriptions.

**Why:** Auth guard (401), ValidationPipe rejection (400), roles guard (403 for non-admin), and routing smoke-tests (not-500 with valid token) are the four categories tested per resource group.
