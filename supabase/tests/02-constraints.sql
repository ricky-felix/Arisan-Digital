-- =============================================================================
-- 02-constraints.sql — Primary keys, foreign keys, UNIQUE, and CHECK constraints
-- =============================================================================
-- Uses pgTAP primitives:
--   col_is_pk(schema, table, column, description)
--   fk_ok(fk_schema, fk_table, fk_columns, pk_schema, pk_table, pk_columns, description)
--   col_is_unique(schema, table, column/columns, description)
--   has_check(schema, table, description)
-- CHECK values are validated via direct SELECT assertions using ok().
-- =============================================================================

BEGIN;

SELECT plan(130);

-- =========================================================================
-- PRIMARY KEYS
-- =========================================================================

SELECT col_is_pk('public', 'users',               'id', 'users PK is id');
SELECT col_is_pk('public', 'groups',              'id', 'groups PK is id');
SELECT col_is_pk('public', 'group_members',       'id', 'group_members PK is id');
SELECT col_is_pk('public', 'rounds',              'id', 'rounds PK is id');
SELECT col_is_pk('public', 'payments',            'id', 'payments PK is id');
SELECT col_is_pk('public', 'notifications',       'id', 'notifications PK is id');
SELECT col_is_pk('public', 'bills',               'id', 'bills PK is id');
SELECT col_is_pk('public', 'bill_participants',   'id', 'bill_participants PK is id');
SELECT col_is_pk('public', 'bill_splits',         'id', 'bill_splits PK is id');
SELECT col_is_pk('public', 'bill_settlements',    'id', 'bill_settlements PK is id');
SELECT col_is_pk('public', 'invite_links',        'id', 'invite_links PK is id');
SELECT col_is_pk('public', 'user_contacts',       'id', 'user_contacts PK is id');
SELECT col_is_pk('public', 'bank_accounts',       'id', 'bank_accounts PK is id');
SELECT col_is_pk('public', 'bill_comments',       'id', 'bill_comments PK is id');
SELECT col_is_pk('public', 'recurring_bills',     'id', 'recurring_bills PK is id');
SELECT col_is_pk('public', 'debt_simplifications','id', 'debt_simplifications PK is id');
SELECT col_is_pk('public', 'plans',               'id', 'plans PK is id');
SELECT col_is_pk('public', 'user_subscriptions',  'id', 'user_subscriptions PK is id');
SELECT col_is_pk('public', 'group_subscriptions', 'id', 'group_subscriptions PK is id');
SELECT col_is_pk('public', 'payment_transactions','id', 'payment_transactions PK is id');
SELECT col_is_pk('public', 'usage_tracking',      'id', 'usage_tracking PK is id');

-- =========================================================================
-- FOREIGN KEYS
-- =========================================================================

-- users references auth.users
SELECT fk_ok(
  'public', 'users', ARRAY['id'],
  'auth', 'users', ARRAY['id'],
  'users.id FK → auth.users.id'
);

-- groups.admin_id → users.id
SELECT fk_ok(
  'public', 'groups', ARRAY['admin_id'],
  'public', 'users', ARRAY['id'],
  'groups.admin_id FK → users.id'
);

-- group_members.group_id → groups.id
SELECT fk_ok(
  'public', 'group_members', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'group_members.group_id FK → groups.id'
);

-- rounds.group_id → groups.id
SELECT fk_ok(
  'public', 'rounds', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'rounds.group_id FK → groups.id'
);

-- rounds.recipient_id → users.id (nullable FK)
SELECT fk_ok(
  'public', 'rounds', ARRAY['recipient_id'],
  'public', 'users', ARRAY['id'],
  'rounds.recipient_id FK → users.id'
);

-- payments.group_id → groups.id
SELECT fk_ok(
  'public', 'payments', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'payments.group_id FK → groups.id'
);

-- payments.round_id → rounds.id
SELECT fk_ok(
  'public', 'payments', ARRAY['round_id'],
  'public', 'rounds', ARRAY['id'],
  'payments.round_id FK → rounds.id'
);

-- notifications.user_id → users.id
SELECT fk_ok(
  'public', 'notifications', ARRAY['user_id'],
  'public', 'users', ARRAY['id'],
  'notifications.user_id FK → users.id'
);

-- bills.paid_by → users.id
SELECT fk_ok(
  'public', 'bills', ARRAY['paid_by'],
  'public', 'users', ARRAY['id'],
  'bills.paid_by FK → users.id'
);

-- bills.group_id → groups.id (nullable)
SELECT fk_ok(
  'public', 'bills', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'bills.group_id FK → groups.id'
);

-- bills.recurring_bill_id → recurring_bills.id (nullable)
SELECT fk_ok(
  'public', 'bills', ARRAY['recurring_bill_id'],
  'public', 'recurring_bills', ARRAY['id'],
  'bills.recurring_bill_id FK → recurring_bills.id'
);

-- bill_participants.bill_id → bills.id
SELECT fk_ok(
  'public', 'bill_participants', ARRAY['bill_id'],
  'public', 'bills', ARRAY['id'],
  'bill_participants.bill_id FK → bills.id'
);

-- bill_splits.bill_id → bills.id
SELECT fk_ok(
  'public', 'bill_splits', ARRAY['bill_id'],
  'public', 'bills', ARRAY['id'],
  'bill_splits.bill_id FK → bills.id'
);

-- bill_splits.participant_id → bill_participants.id
SELECT fk_ok(
  'public', 'bill_splits', ARRAY['participant_id'],
  'public', 'bill_participants', ARRAY['id'],
  'bill_splits.participant_id FK → bill_participants.id'
);

-- bill_settlements.bill_id → bills.id
SELECT fk_ok(
  'public', 'bill_settlements', ARRAY['bill_id'],
  'public', 'bills', ARRAY['id'],
  'bill_settlements.bill_id FK → bills.id'
);

-- bill_settlements.payer_id → users.id
SELECT fk_ok(
  'public', 'bill_settlements', ARRAY['payer_id'],
  'public', 'users', ARRAY['id'],
  'bill_settlements.payer_id FK → users.id'
);

-- bill_settlements.receiver_id → users.id
SELECT fk_ok(
  'public', 'bill_settlements', ARRAY['receiver_id'],
  'public', 'users', ARRAY['id'],
  'bill_settlements.receiver_id FK → users.id'
);

-- invite_links.group_id → groups.id
SELECT fk_ok(
  'public', 'invite_links', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'invite_links.group_id FK → groups.id'
);

-- invite_links.created_by → users.id
SELECT fk_ok(
  'public', 'invite_links', ARRAY['created_by'],
  'public', 'users', ARRAY['id'],
  'invite_links.created_by FK → users.id'
);

-- user_contacts.owner_id → users.id
SELECT fk_ok(
  'public', 'user_contacts', ARRAY['owner_id'],
  'public', 'users', ARRAY['id'],
  'user_contacts.owner_id FK → users.id'
);

-- user_contacts.contact_id → users.id (nullable)
SELECT fk_ok(
  'public', 'user_contacts', ARRAY['contact_id'],
  'public', 'users', ARRAY['id'],
  'user_contacts.contact_id FK → users.id (nullable)'
);

-- bank_accounts.user_id → users.id
SELECT fk_ok(
  'public', 'bank_accounts', ARRAY['user_id'],
  'public', 'users', ARRAY['id'],
  'bank_accounts.user_id FK → users.id'
);

-- bill_comments.bill_id → bills.id
SELECT fk_ok(
  'public', 'bill_comments', ARRAY['bill_id'],
  'public', 'bills', ARRAY['id'],
  'bill_comments.bill_id FK → bills.id'
);

-- bill_comments.user_id → users.id
SELECT fk_ok(
  'public', 'bill_comments', ARRAY['user_id'],
  'public', 'users', ARRAY['id'],
  'bill_comments.user_id FK → users.id'
);

-- bill_comments.parent_id → bill_comments.id (self-referential nullable)
SELECT fk_ok(
  'public', 'bill_comments', ARRAY['parent_id'],
  'public', 'bill_comments', ARRAY['id'],
  'bill_comments.parent_id FK → bill_comments.id (self-ref)'
);

-- recurring_bills.paid_by → users.id
SELECT fk_ok(
  'public', 'recurring_bills', ARRAY['paid_by'],
  'public', 'users', ARRAY['id'],
  'recurring_bills.paid_by FK → users.id'
);

-- recurring_bills.group_id → groups.id (nullable)
SELECT fk_ok(
  'public', 'recurring_bills', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'recurring_bills.group_id FK → groups.id (nullable)'
);

-- debt_simplifications.bill_id → bills.id
SELECT fk_ok(
  'public', 'debt_simplifications', ARRAY['bill_id'],
  'public', 'bills', ARRAY['id'],
  'debt_simplifications.bill_id FK → bills.id'
);

-- debt_simplifications.from_user_id → users.id
SELECT fk_ok(
  'public', 'debt_simplifications', ARRAY['from_user_id'],
  'public', 'users', ARRAY['id'],
  'debt_simplifications.from_user_id FK → users.id'
);

-- debt_simplifications.to_user_id → users.id
SELECT fk_ok(
  'public', 'debt_simplifications', ARRAY['to_user_id'],
  'public', 'users', ARRAY['id'],
  'debt_simplifications.to_user_id FK → users.id'
);

-- user_subscriptions.user_id → users.id
SELECT fk_ok(
  'public', 'user_subscriptions', ARRAY['user_id'],
  'public', 'users', ARRAY['id'],
  'user_subscriptions.user_id FK → users.id'
);

-- user_subscriptions.plan_id → plans.id
SELECT fk_ok(
  'public', 'user_subscriptions', ARRAY['plan_id'],
  'public', 'plans', ARRAY['id'],
  'user_subscriptions.plan_id FK → plans.id'
);

-- group_subscriptions.group_id → groups.id
SELECT fk_ok(
  'public', 'group_subscriptions', ARRAY['group_id'],
  'public', 'groups', ARRAY['id'],
  'group_subscriptions.group_id FK → groups.id'
);

-- group_subscriptions.paid_by → users.id
SELECT fk_ok(
  'public', 'group_subscriptions', ARRAY['paid_by'],
  'public', 'users', ARRAY['id'],
  'group_subscriptions.paid_by FK → users.id'
);

-- group_subscriptions.plan_id → plans.id
SELECT fk_ok(
  'public', 'group_subscriptions', ARRAY['plan_id'],
  'public', 'plans', ARRAY['id'],
  'group_subscriptions.plan_id FK → plans.id'
);

-- payment_transactions.user_id → users.id
SELECT fk_ok(
  'public', 'payment_transactions', ARRAY['user_id'],
  'public', 'users', ARRAY['id'],
  'payment_transactions.user_id FK → users.id'
);

-- payment_transactions.subscription_id → user_subscriptions.id (nullable)
SELECT fk_ok(
  'public', 'payment_transactions', ARRAY['subscription_id'],
  'public', 'user_subscriptions', ARRAY['id'],
  'payment_transactions.subscription_id FK → user_subscriptions.id (nullable)'
);

-- payment_transactions.group_subscription_id → group_subscriptions.id (nullable)
SELECT fk_ok(
  'public', 'payment_transactions', ARRAY['group_subscription_id'],
  'public', 'group_subscriptions', ARRAY['id'],
  'payment_transactions.group_subscription_id FK → group_subscriptions.id (nullable)'
);

-- usage_tracking.user_id → users.id
SELECT fk_ok(
  'public', 'usage_tracking', ARRAY['user_id'],
  'public', 'users', ARRAY['id'],
  'usage_tracking.user_id FK → users.id'
);

-- =========================================================================
-- UNIQUE CONSTRAINTS
-- =========================================================================

-- users.phone is UNIQUE
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'users'
     AND ccu.column_name = 'phone') >= 1,
  'users.phone has UNIQUE constraint'
);

-- group_members: UNIQUE(group_id, user_id)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'group_members') >= 2,
  'group_members has at least 2 UNIQUE constraints (group_id+user_id and group_id+giliran_order)'
);

-- rounds: UNIQUE(group_id, round_number)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'rounds') >= 1,
  'rounds has UNIQUE constraint (group_id, round_number)'
);

-- payments: UNIQUE(round_id, payer_id)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'payments') >= 1,
  'payments has UNIQUE constraint (round_id, payer_id)'
);

-- bill_participants: UNIQUE(bill_id, user_id)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'bill_participants') >= 1,
  'bill_participants has UNIQUE constraint (bill_id, user_id)'
);

-- bill_splits: UNIQUE(bill_id, user_id)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'bill_splits') >= 1,
  'bill_splits has UNIQUE constraint (bill_id, user_id)'
);

-- invite_links.token is UNIQUE
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'invite_links'
     AND ccu.column_name = 'token') >= 1,
  'invite_links.token has UNIQUE constraint'
);

-- user_contacts: UNIQUE(owner_id, phone)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'user_contacts') >= 1,
  'user_contacts has UNIQUE constraint (owner_id, phone)'
);

-- bank_accounts: UNIQUE(user_id)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'bank_accounts'
     AND ccu.column_name = 'user_id') >= 1,
  'bank_accounts.user_id has UNIQUE constraint'
);

-- plans.slug is UNIQUE
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'plans'
     AND ccu.column_name = 'slug') >= 1,
  'plans.slug has UNIQUE constraint'
);

-- user_subscriptions: UNIQUE(user_id) — one active subscription per user
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'user_subscriptions'
     AND ccu.column_name = 'user_id') >= 1,
  'user_subscriptions.user_id has UNIQUE constraint (one sub per user)'
);

-- group_subscriptions: UNIQUE(group_id)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'group_subscriptions'
     AND ccu.column_name = 'group_id') >= 1,
  'group_subscriptions.group_id has UNIQUE constraint'
);

-- usage_tracking: UNIQUE(user_id, period_month)
SELECT ok(
  (SELECT count(*) FROM information_schema.table_constraints tc
   WHERE tc.constraint_type = 'UNIQUE'
     AND tc.table_schema = 'public' AND tc.table_name = 'usage_tracking') >= 1,
  'usage_tracking has UNIQUE constraint (user_id, period_month)'
);

-- =========================================================================
-- CHECK CONSTRAINT VALUES (verified via information_schema + pg_get_constraintdef)
-- =========================================================================

-- Helper: returns true when a check constraint body matches a substring.
-- We use pg_get_constraintdef() which is available in standard Postgres.

-- users.language IN ('id', 'en')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'users'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''id''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''en''%'
      AND pg_get_constraintdef(c.oid) LIKE '%language%'
  ),
  'users.language CHECK includes id, en'
);

-- users.platform_role IN ('user', 'super_admin')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'users'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''user''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''super_admin''%'
      AND pg_get_constraintdef(c.oid) LIKE '%platform_role%'
  ),
  'users.platform_role CHECK includes user, super_admin'
);

-- users.gender IN ('male', 'female')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'users'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''male''%'
      AND pg_get_constraintdef(c.oid) LIKE '%gender%'
  ),
  'users.gender CHECK includes male, female'
);

-- groups.frequency IN ('weekly', 'monthly')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'groups'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''weekly''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''monthly''%'
      AND pg_get_constraintdef(c.oid) LIKE '%frequency%'
  ),
  'groups.frequency CHECK includes weekly, monthly'
);

-- groups.giliran_method IN ('random', 'manual')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'groups'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''random''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''manual''%'
  ),
  'groups.giliran_method CHECK includes random, manual'
);

-- groups.status IN ('active', 'completed', 'pending')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'groups'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''active''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''completed''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''pending''%'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  ),
  'groups.status CHECK includes active, completed, pending'
);

-- group_members.group_role IN ('member', 'admin')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'group_members'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''member''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''admin''%'
  ),
  'group_members.group_role CHECK includes member, admin'
);

-- rounds.status IN ('upcoming', 'active', 'completed')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'rounds'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''upcoming''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''active''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''completed''%'
  ),
  'rounds.status CHECK includes upcoming, active, completed'
);

-- payments.status IN ('pending', 'confirmed', 'rejected')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'payments'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''confirmed''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''rejected''%'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  ),
  'payments.status CHECK includes pending, confirmed, rejected'
);

-- notifications.type CHECK (all 11 values)
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'notifications'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%payment_due%'
      AND pg_get_constraintdef(c.oid) LIKE '%bill_created%'
      AND pg_get_constraintdef(c.oid) LIKE '%settlement_confirmed%'
  ),
  'notifications.type CHECK contains expected notification types'
);

-- bills.split_method IN ('equal', 'exact', 'percentage', 'shares')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'bills'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''equal''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''percentage''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''shares''%'
  ),
  'bills.split_method CHECK includes equal, exact, percentage, shares'
);

-- bills.status IN ('open', 'settled')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'bills'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''open''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''settled''%'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  ),
  'bills.status CHECK includes open, settled'
);

-- bill_settlements.status IN ('pending', 'confirmed', 'rejected')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'bill_settlements'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''pending''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''confirmed''%'
  ),
  'bill_settlements.status CHECK includes pending, confirmed, rejected'
);

-- debt_simplifications.status IN ('pending', 'settled', 'dismissed')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'debt_simplifications'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''dismissed''%'
  ),
  'debt_simplifications.status CHECK includes pending, settled, dismissed'
);

-- recurring_bills.frequency IN ('weekly', 'monthly', 'yearly')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'recurring_bills'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''yearly''%'
      AND pg_get_constraintdef(c.oid) LIKE '%frequency%'
  ),
  'recurring_bills.frequency CHECK includes weekly, monthly, yearly'
);

-- user_subscriptions.billing_cycle IN ('monthly', 'yearly')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'user_subscriptions'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%billing_cycle%'
      AND pg_get_constraintdef(c.oid) LIKE '%''monthly''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''yearly''%'
  ),
  'user_subscriptions.billing_cycle CHECK includes monthly, yearly'
);

-- user_subscriptions.status IN ('active', 'cancelled', 'expired', 'past_due')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'user_subscriptions'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''past_due''%'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  ),
  'user_subscriptions.status CHECK includes active, cancelled, expired, past_due'
);

-- user_subscriptions.gateway IN ('xendit', 'midtrans', 'manual')
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'user_subscriptions'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''xendit''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''midtrans''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''manual''%'
  ),
  'user_subscriptions.gateway CHECK includes xendit, midtrans, manual'
);

-- payment_transactions.type CHECK values
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'payment_transactions'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%subscription_new%'
      AND pg_get_constraintdef(c.oid) LIKE '%in_app_payment%'
  ),
  'payment_transactions.type CHECK includes subscription_new, in_app_payment'
);

-- payment_transactions.status CHECK
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND cl.relname = 'payment_transactions'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%''refunded''%'
      AND pg_get_constraintdef(c.oid) LIKE '%''expired''%'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  ),
  'payment_transactions.status CHECK includes paid, failed, refunded, expired'
);

-- =========================================================================
-- SEED DATA — verify default plans were inserted
-- =========================================================================

SELECT ok(
  (SELECT count(*) FROM public.plans WHERE slug = 'free') = 1,
  'plans table has seeded free plan'
);

SELECT ok(
  (SELECT count(*) FROM public.plans WHERE slug = 'boss') = 1,
  'plans table has seeded boss plan'
);

SELECT ok(
  (SELECT count(*) FROM public.plans WHERE slug = 'business') = 1,
  'plans table has seeded business plan'
);

SELECT ok(
  (SELECT price_monthly FROM public.plans WHERE slug = 'free') = 0,
  'free plan price_monthly is 0'
);

SELECT ok(
  (SELECT price_monthly FROM public.plans WHERE slug = 'boss') = 29000,
  'boss plan price_monthly is 29000'
);

SELECT ok(
  (SELECT price_monthly FROM public.plans WHERE slug = 'business') = 199000,
  'business plan price_monthly is 199000'
);

SELECT ok(
  (SELECT max_groups FROM public.plans WHERE slug = 'free') = 2,
  'free plan max_groups is 2'
);

SELECT ok(
  (SELECT max_bills_per_month FROM public.plans WHERE slug = 'free') = 5,
  'free plan max_bills_per_month is 5'
);

SELECT ok(
  (SELECT white_label FROM public.plans WHERE slug = 'business') = TRUE,
  'business plan has white_label = TRUE'
);

SELECT ok(
  (SELECT recurring_bills FROM public.plans WHERE slug = 'boss') = TRUE,
  'boss plan has recurring_bills = TRUE'
);

SELECT * FROM finish();
ROLLBACK;
