-- =============================================================================
-- 04-functions-triggers.sql — Function and trigger existence tests
-- =============================================================================
-- Uses pgTAP primitives:
--   has_function(schema, function_name, description)
--   has_function(schema, function_name, args[], description) — for overloads
--   has_trigger(schema, table, trigger_name, description)
--
-- Also smoke-tests function return types and security attributes via
-- pg_proc queries.
-- =============================================================================

BEGIN;

SELECT plan(38);

-- =========================================================================
-- FUNCTIONS — existence checks
-- =========================================================================

-- is_super_admin() — schema.sql
SELECT has_function(
  'public',
  'is_super_admin',
  'function is_super_admin() exists'
);

-- is_group_admin(uuid) — schema.sql
SELECT has_function(
  'public',
  'is_group_admin',
  ARRAY['uuid'],
  'function is_group_admin(uuid) exists'
);

-- is_group_member(uuid) — migration-mvp
SELECT has_function(
  'public',
  'is_group_member',
  ARRAY['uuid'],
  'function is_group_member(uuid) exists'
);

-- is_bill_participant(uuid) — migration-mvp
SELECT has_function(
  'public',
  'is_bill_participant',
  ARRAY['uuid'],
  'function is_bill_participant(uuid) exists'
);

-- is_bill_payer(uuid) — migration-mvp
SELECT has_function(
  'public',
  'is_bill_payer',
  ARRAY['uuid'],
  'function is_bill_payer(uuid) exists'
);

-- is_group_co_member(uuid) — migration-payment-methods-v1
SELECT has_function(
  'public',
  'is_group_co_member',
  ARRAY['uuid'],
  'function is_group_co_member(uuid) exists'
);

-- handle_new_user() — schema.sql (trigger function)
SELECT has_function(
  'public',
  'handle_new_user',
  'function handle_new_user() exists'
);

-- =========================================================================
-- FUNCTION RETURN TYPES
-- =========================================================================

-- is_super_admin() returns boolean
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_super_admin') = 'boolean',
  'is_super_admin() returns boolean'
);

-- is_group_admin(uuid) returns boolean
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_admin') = 'boolean',
  'is_group_admin(uuid) returns boolean'
);

-- is_group_member(uuid) returns boolean
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_member') = 'boolean',
  'is_group_member(uuid) returns boolean'
);

-- is_bill_participant(uuid) returns boolean
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_bill_participant') = 'boolean',
  'is_bill_participant(uuid) returns boolean'
);

-- is_bill_payer(uuid) returns boolean
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_bill_payer') = 'boolean',
  'is_bill_payer(uuid) returns boolean'
);

-- is_group_co_member(uuid) returns boolean
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_co_member') = 'boolean',
  'is_group_co_member(uuid) returns boolean'
);

-- handle_new_user() returns trigger
SELECT ok(
  (SELECT pg_get_function_result(p.oid)
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') = 'trigger',
  'handle_new_user() returns trigger'
);

-- =========================================================================
-- SECURITY DEFINER attribute — all helper functions must be SECURITY DEFINER
-- to avoid recursive RLS evaluation
-- =========================================================================

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_super_admin') = TRUE,
  'is_super_admin() is SECURITY DEFINER'
);

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_admin') = TRUE,
  'is_group_admin(uuid) is SECURITY DEFINER'
);

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_member') = TRUE,
  'is_group_member(uuid) is SECURITY DEFINER'
);

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_bill_participant') = TRUE,
  'is_bill_participant(uuid) is SECURITY DEFINER'
);

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_bill_payer') = TRUE,
  'is_bill_payer(uuid) is SECURITY DEFINER'
);

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_co_member') = TRUE,
  'is_group_co_member(uuid) is SECURITY DEFINER'
);

SELECT ok(
  (SELECT p.prosecdef
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') = TRUE,
  'handle_new_user() is SECURITY DEFINER'
);

-- =========================================================================
-- FUNCTION VOLATILITY — RLS helpers should be STABLE (not VOLATILE)
-- so Postgres can cache per-statement and avoid re-evaluation on each row
-- =========================================================================

-- provolatile: 'i' = immutable, 's' = stable, 'v' = volatile
SELECT ok(
  (SELECT p.provolatile
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_super_admin') = 's',
  'is_super_admin() is STABLE'
);

SELECT ok(
  (SELECT p.provolatile
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_admin') = 's',
  'is_group_admin(uuid) is STABLE'
);

SELECT ok(
  (SELECT p.provolatile
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_member') = 's',
  'is_group_member(uuid) is STABLE'
);

SELECT ok(
  (SELECT p.provolatile
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_bill_participant') = 's',
  'is_bill_participant(uuid) is STABLE'
);

SELECT ok(
  (SELECT p.provolatile
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_bill_payer') = 's',
  'is_bill_payer(uuid) is STABLE'
);

SELECT ok(
  (SELECT p.provolatile
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'is_group_co_member') = 's',
  'is_group_co_member(uuid) is STABLE'
);

-- =========================================================================
-- TRIGGERS — existence checks
-- =========================================================================

-- on_auth_user_created — fires AFTER INSERT on auth.users
SELECT has_trigger(
  'auth',
  'users',
  'on_auth_user_created',
  'trigger on_auth_user_created exists on auth.users'
);

-- =========================================================================
-- TRIGGER ATTRIBUTES
-- =========================================================================

-- on_auth_user_created should be an AFTER INSERT FOR EACH ROW trigger
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'on_auth_user_created'
      AND t.tgtype & 4 > 0   -- bit 2: AFTER
      AND t.tgtype & 8 > 0   -- bit 3: INSERT (tgtype includes INSERT)
  ),
  'on_auth_user_created is AFTER INSERT trigger'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'on_auth_user_created'
      -- FOR EACH ROW: tgtype & 1 = 1
      AND t.tgtype & 1 > 0
  ),
  'on_auth_user_created is FOR EACH ROW trigger'
);

-- Trigger function for on_auth_user_created should be handle_new_user
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace np ON np.oid = p.pronamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'on_auth_user_created'
      AND p.proname = 'handle_new_user'
      AND np.nspname = 'public'
  ),
  'on_auth_user_created executes public.handle_new_user'
);

-- =========================================================================
-- FUNCTION LOGIC SMOKE TESTS (can only run as superuser in test DB)
-- =========================================================================

-- is_super_admin() called without auth context should return FALSE (no uid)
SELECT ok(
  public.is_super_admin() = FALSE,
  'is_super_admin() returns FALSE with no auth context'
);

-- is_group_member(gen_random_uuid()) with no auth context returns FALSE
SELECT ok(
  public.is_group_member(gen_random_uuid()) = FALSE,
  'is_group_member(random_uuid) returns FALSE with no auth context'
);

-- is_bill_participant(gen_random_uuid()) with no auth context returns FALSE
SELECT ok(
  public.is_bill_participant(gen_random_uuid()) = FALSE,
  'is_bill_participant(random_uuid) returns FALSE with no auth context'
);

-- is_bill_payer(gen_random_uuid()) with no auth context returns FALSE
SELECT ok(
  public.is_bill_payer(gen_random_uuid()) = FALSE,
  'is_bill_payer(random_uuid) returns FALSE with no auth context'
);

-- is_group_co_member(gen_random_uuid()) with no auth context returns FALSE
SELECT ok(
  public.is_group_co_member(gen_random_uuid()) = FALSE,
  'is_group_co_member(random_uuid) returns FALSE with no auth context'
);

SELECT * FROM finish();
ROLLBACK;
