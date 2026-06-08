-- =============================================================================
-- 03-rls.sql — Row Level Security enablement and policy existence tests
-- =============================================================================
-- Uses pgTAP primitives:
--   table_privs_are(schema, table, role, privileges[], description) — not used here
-- We query pg_policies directly for policy names, which is the most reliable
-- approach for both Supabase-hosted and self-hosted Postgres instances.
-- Also uses pgTAP's ok() + has_row_security() where available.
--
-- Convention: policy names match schema.sql / migrations exactly.
-- =============================================================================

BEGIN;

SELECT plan(85);

-- =========================================================================
-- RLS ENABLED — verify pg_class.relrowsecurity = TRUE for each table
-- =========================================================================

-- Helper inline: true when RLS is enabled on a public table
CREATE OR REPLACE FUNCTION _test_rls_enabled(p_table text)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT relrowsecurity
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = p_table;
$$;

SELECT ok(_test_rls_enabled('users'),               'RLS enabled on users');
SELECT ok(_test_rls_enabled('groups'),              'RLS enabled on groups');
SELECT ok(_test_rls_enabled('group_members'),       'RLS enabled on group_members');
SELECT ok(_test_rls_enabled('rounds'),              'RLS enabled on rounds');
SELECT ok(_test_rls_enabled('payments'),            'RLS enabled on payments');
SELECT ok(_test_rls_enabled('notifications'),       'RLS enabled on notifications');
SELECT ok(_test_rls_enabled('bills'),               'RLS enabled on bills');
SELECT ok(_test_rls_enabled('bill_participants'),   'RLS enabled on bill_participants');
SELECT ok(_test_rls_enabled('bill_splits'),         'RLS enabled on bill_splits');
SELECT ok(_test_rls_enabled('bill_settlements'),    'RLS enabled on bill_settlements');
SELECT ok(_test_rls_enabled('invite_links'),        'RLS enabled on invite_links');
SELECT ok(_test_rls_enabled('user_contacts'),       'RLS enabled on user_contacts');
SELECT ok(_test_rls_enabled('bank_accounts'),       'RLS enabled on bank_accounts');
SELECT ok(_test_rls_enabled('bill_comments'),       'RLS enabled on bill_comments');
SELECT ok(_test_rls_enabled('recurring_bills'),     'RLS enabled on recurring_bills');
SELECT ok(_test_rls_enabled('debt_simplifications'),'RLS enabled on debt_simplifications');
SELECT ok(_test_rls_enabled('plans'),               'RLS enabled on plans');
SELECT ok(_test_rls_enabled('user_subscriptions'),  'RLS enabled on user_subscriptions');
SELECT ok(_test_rls_enabled('group_subscriptions'), 'RLS enabled on group_subscriptions');
SELECT ok(_test_rls_enabled('payment_transactions'),'RLS enabled on payment_transactions');
SELECT ok(_test_rls_enabled('usage_tracking'),      'RLS enabled on usage_tracking');

-- =========================================================================
-- POLICY EXISTENCE — verified by checking pg_policies
-- =========================================================================

-- Helper: true when a named policy exists on a given table
CREATE OR REPLACE FUNCTION _test_policy_exists(p_table text, p_policy text)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = p_table
      AND policyname = p_policy
  );
$$;

-- ---------------------------------------------------------------------------
-- USERS — policies (migration-payment-methods-v1 replaced users_select_own
--          with users_select_own_or_peer)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('users', 'users_select_own_or_peer'),
  'policy users_select_own_or_peer exists on users');
SELECT ok(_test_policy_exists('users', 'users_insert_own'),
  'policy users_insert_own exists on users');
SELECT ok(_test_policy_exists('users', 'users_update_own'),
  'policy users_update_own exists on users');

-- ---------------------------------------------------------------------------
-- GROUPS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('groups', 'groups_select_member'),
  'policy groups_select_member exists on groups');
SELECT ok(_test_policy_exists('groups', 'groups_insert_auth'),
  'policy groups_insert_auth exists on groups');
SELECT ok(_test_policy_exists('groups', 'groups_update_admin'),
  'policy groups_update_admin exists on groups');
SELECT ok(_test_policy_exists('groups', 'groups_delete_admin'),
  'policy groups_delete_admin exists on groups');

-- ---------------------------------------------------------------------------
-- GROUP_MEMBERS (migration-mvp replaced the original policy and added more)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('group_members', 'gm_select_member'),
  'policy gm_select_member exists on group_members');
SELECT ok(_test_policy_exists('group_members', 'gm_insert'),
  'policy gm_insert exists on group_members');
SELECT ok(_test_policy_exists('group_members', 'gm_update'),
  'policy gm_update exists on group_members');
SELECT ok(_test_policy_exists('group_members', 'gm_delete'),
  'policy gm_delete exists on group_members');

-- ---------------------------------------------------------------------------
-- ROUNDS (migration-mvp added insert/update/delete policies)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('rounds', 'rounds_select_member'),
  'policy rounds_select_member exists on rounds');
SELECT ok(_test_policy_exists('rounds', 'rounds_insert'),
  'policy rounds_insert exists on rounds');
SELECT ok(_test_policy_exists('rounds', 'rounds_update'),
  'policy rounds_update exists on rounds');
SELECT ok(_test_policy_exists('rounds', 'rounds_delete'),
  'policy rounds_delete exists on rounds');

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('payments', 'payments_select'),
  'policy payments_select exists on payments');
SELECT ok(_test_policy_exists('payments', 'payments_insert'),
  'policy payments_insert exists on payments');
SELECT ok(_test_policy_exists('payments', 'payments_update'),
  'policy payments_update exists on payments');
SELECT ok(_test_policy_exists('payments', 'payments_delete'),
  'policy payments_delete exists on payments');

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('notifications', 'notifs_select_own'),
  'policy notifs_select_own exists on notifications');
SELECT ok(_test_policy_exists('notifications', 'notifs_update_own'),
  'policy notifs_update_own exists on notifications');

-- ---------------------------------------------------------------------------
-- BILLS (migration-mvp replaced bills_select and added bills_delete_payer)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('bills', 'bills_select'),
  'policy bills_select exists on bills');
SELECT ok(_test_policy_exists('bills', 'bills_insert_auth'),
  'policy bills_insert_auth exists on bills');
SELECT ok(_test_policy_exists('bills', 'bills_update_payer'),
  'policy bills_update_payer exists on bills');
SELECT ok(_test_policy_exists('bills', 'bills_delete_payer'),
  'policy bills_delete_payer exists on bills');

-- ---------------------------------------------------------------------------
-- BILL_PARTICIPANTS (migration-mvp replaced bp_select and added CRUD policies)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('bill_participants', 'bp_select'),
  'policy bp_select exists on bill_participants');
SELECT ok(_test_policy_exists('bill_participants', 'bp_insert'),
  'policy bp_insert exists on bill_participants');
SELECT ok(_test_policy_exists('bill_participants', 'bp_update'),
  'policy bp_update exists on bill_participants');
SELECT ok(_test_policy_exists('bill_participants', 'bp_delete'),
  'policy bp_delete exists on bill_participants');

-- ---------------------------------------------------------------------------
-- BILL_SPLITS (migration-mvp replaced bs_select and added CRUD)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('bill_splits', 'bs_select'),
  'policy bs_select exists on bill_splits');
SELECT ok(_test_policy_exists('bill_splits', 'bs_insert'),
  'policy bs_insert exists on bill_splits');
SELECT ok(_test_policy_exists('bill_splits', 'bs_update'),
  'policy bs_update exists on bill_splits');
SELECT ok(_test_policy_exists('bill_splits', 'bs_delete'),
  'policy bs_delete exists on bill_splits');

-- ---------------------------------------------------------------------------
-- BILL_SETTLEMENTS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('bill_settlements', 'bsettl_select'),
  'policy bsettl_select exists on bill_settlements');
SELECT ok(_test_policy_exists('bill_settlements', 'bsettl_insert'),
  'policy bsettl_insert exists on bill_settlements');
SELECT ok(_test_policy_exists('bill_settlements', 'bsettl_update_receiver'),
  'policy bsettl_update_receiver exists on bill_settlements');

-- ---------------------------------------------------------------------------
-- INVITE_LINKS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('invite_links', 'invite_select_admin'),
  'policy invite_select_admin exists on invite_links');
SELECT ok(_test_policy_exists('invite_links', 'invite_insert_admin'),
  'policy invite_insert_admin exists on invite_links');
SELECT ok(_test_policy_exists('invite_links', 'invite_update_admin'),
  'policy invite_update_admin exists on invite_links');

-- ---------------------------------------------------------------------------
-- USER_CONTACTS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('user_contacts', 'contacts_select_own'),
  'policy contacts_select_own exists on user_contacts');
SELECT ok(_test_policy_exists('user_contacts', 'contacts_insert_own'),
  'policy contacts_insert_own exists on user_contacts');
SELECT ok(_test_policy_exists('user_contacts', 'contacts_update_own'),
  'policy contacts_update_own exists on user_contacts');
SELECT ok(_test_policy_exists('user_contacts', 'contacts_delete_own'),
  'policy contacts_delete_own exists on user_contacts');

-- ---------------------------------------------------------------------------
-- BANK_ACCOUNTS (migration-c2-c3)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('bank_accounts', 'ba_select_own'),
  'policy ba_select_own exists on bank_accounts');
SELECT ok(_test_policy_exists('bank_accounts', 'ba_insert_own'),
  'policy ba_insert_own exists on bank_accounts');
SELECT ok(_test_policy_exists('bank_accounts', 'ba_update_own'),
  'policy ba_update_own exists on bank_accounts');
SELECT ok(_test_policy_exists('bank_accounts', 'ba_delete_own'),
  'policy ba_delete_own exists on bank_accounts');

-- ---------------------------------------------------------------------------
-- BILL_COMMENTS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('bill_comments', 'comments_select'),
  'policy comments_select exists on bill_comments');
SELECT ok(_test_policy_exists('bill_comments', 'comments_insert'),
  'policy comments_insert exists on bill_comments');
SELECT ok(_test_policy_exists('bill_comments', 'comments_update_own'),
  'policy comments_update_own exists on bill_comments');

-- ---------------------------------------------------------------------------
-- RECURRING_BILLS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('recurring_bills', 'recurring_select'),
  'policy recurring_select exists on recurring_bills');
SELECT ok(_test_policy_exists('recurring_bills', 'recurring_insert'),
  'policy recurring_insert exists on recurring_bills');
SELECT ok(_test_policy_exists('recurring_bills', 'recurring_update'),
  'policy recurring_update exists on recurring_bills');
SELECT ok(_test_policy_exists('recurring_bills', 'recurring_delete'),
  'policy recurring_delete exists on recurring_bills');

-- ---------------------------------------------------------------------------
-- DEBT_SIMPLIFICATIONS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('debt_simplifications', 'debt_select'),
  'policy debt_select exists on debt_simplifications');
SELECT ok(_test_policy_exists('debt_simplifications', 'debt_update_from'),
  'policy debt_update_from exists on debt_simplifications');

-- ---------------------------------------------------------------------------
-- PLANS (migration-mvp)
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('plans', 'plans_select_all'),
  'policy plans_select_all exists on plans');

-- ---------------------------------------------------------------------------
-- USER_SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('user_subscriptions', 'sub_select_own'),
  'policy sub_select_own exists on user_subscriptions');
SELECT ok(_test_policy_exists('user_subscriptions', 'sub_select_sadmin'),
  'policy sub_select_sadmin exists on user_subscriptions');

-- ---------------------------------------------------------------------------
-- GROUP_SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('group_subscriptions', 'gsub_select_admin'),
  'policy gsub_select_admin exists on group_subscriptions');

-- ---------------------------------------------------------------------------
-- PAYMENT_TRANSACTIONS
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('payment_transactions', 'tx_select_own'),
  'policy tx_select_own exists on payment_transactions');
SELECT ok(_test_policy_exists('payment_transactions', 'tx_select_sadmin'),
  'policy tx_select_sadmin exists on payment_transactions');

-- ---------------------------------------------------------------------------
-- USAGE_TRACKING
-- ---------------------------------------------------------------------------
SELECT ok(_test_policy_exists('usage_tracking', 'usage_select_own'),
  'policy usage_select_own exists on usage_tracking');
SELECT ok(_test_policy_exists('usage_tracking', 'usage_select_sadmin'),
  'policy usage_select_sadmin exists on usage_tracking');

-- =========================================================================
-- POLICY COMMAND/PERMISSIVE correctness spot-checks via pg_policies columns
-- =========================================================================

-- payments_select is permissive SELECT
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'payments_select') = 'SELECT',
  'payments_select policy is for SELECT'
);

-- ba_select_own is permissive SELECT
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_accounts' AND policyname = 'ba_select_own') = 'SELECT',
  'ba_select_own policy is for SELECT'
);

-- ba_insert_own is INSERT
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_accounts' AND policyname = 'ba_insert_own') = 'INSERT',
  'ba_insert_own policy is for INSERT'
);

-- groups_delete_admin is DELETE
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'groups' AND policyname = 'groups_delete_admin') = 'DELETE',
  'groups_delete_admin policy is for DELETE'
);

-- bills_update_payer is UPDATE
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bills' AND policyname = 'bills_update_payer') = 'UPDATE',
  'bills_update_payer policy is for UPDATE'
);

-- bsettl_update_receiver is UPDATE
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bill_settlements' AND policyname = 'bsettl_update_receiver') = 'UPDATE',
  'bsettl_update_receiver policy is for UPDATE'
);

-- plans_select_all is SELECT (public catalog read)
SELECT ok(
  (SELECT cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'plans' AND policyname = 'plans_select_all') = 'SELECT',
  'plans_select_all policy is for SELECT'
);

SELECT * FROM finish();
ROLLBACK;
