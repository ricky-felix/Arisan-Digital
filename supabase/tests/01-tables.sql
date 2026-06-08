-- =============================================================================
-- 01-tables.sql — Table and column existence tests
-- =============================================================================
-- Asserts that every table and its core columns (with correct types) exist as
-- defined in schema.sql + all migrations. Uses pgTAP primitives:
--   has_table(schema, table, description)
--   has_column(schema, table, column, description)
--   col_type_is(schema, table, column, type, description)
--   col_not_null(schema, table, column, description)
--   col_has_default(schema, table, column, description)
-- =============================================================================

BEGIN;

SELECT plan(230);  -- total TAP assertions in this file

-- ---------------------------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'users', 'table users exists');

SELECT has_column('public', 'users', 'id',               'users.id exists');
SELECT has_column('public', 'users', 'name',             'users.name exists');
SELECT has_column('public', 'users', 'phone',            'users.phone exists');
SELECT has_column('public', 'users', 'avatar_url',       'users.avatar_url exists');
SELECT has_column('public', 'users', 'language',         'users.language exists');
SELECT has_column('public', 'users', 'platform_role',    'users.platform_role exists');
SELECT has_column('public', 'users', 'created_at',       'users.created_at exists');
-- migration-profile-fields.sql additions
SELECT has_column('public', 'users', 'gender',           'users.gender exists (migration-profile-fields)');
SELECT has_column('public', 'users', 'payment_methods',  'users.payment_methods exists (migration-profile-fields)');
-- migration-c2-c3-pin-bank.sql additions
SELECT has_column('public', 'users', 'pin_hash',         'users.pin_hash exists (migration-c2-c3)');
SELECT has_column('public', 'users', 'app_lock_enabled', 'users.app_lock_enabled exists (migration-c2-c3)');

SELECT col_type_is('public', 'users', 'id',              'uuid',        'users.id is uuid');
SELECT col_type_is('public', 'users', 'name',            'text',        'users.name is text');
SELECT col_type_is('public', 'users', 'phone',           'text',        'users.phone is text');
SELECT col_type_is('public', 'users', 'language',        'text',        'users.language is text');
SELECT col_type_is('public', 'users', 'platform_role',   'text',        'users.platform_role is text');
SELECT col_type_is('public', 'users', 'created_at',      'timestamp with time zone', 'users.created_at is timestamptz');
SELECT col_type_is('public', 'users', 'payment_methods', 'jsonb',       'users.payment_methods is jsonb');
SELECT col_type_is('public', 'users', 'app_lock_enabled','boolean',     'users.app_lock_enabled is boolean');

SELECT col_not_null('public', 'users', 'id',           'users.id NOT NULL');
SELECT col_not_null('public', 'users', 'name',         'users.name NOT NULL');
SELECT col_not_null('public', 'users', 'language',     'users.language NOT NULL');
SELECT col_not_null('public', 'users', 'platform_role','users.platform_role NOT NULL');
SELECT col_not_null('public', 'users', 'created_at',   'users.created_at NOT NULL');

SELECT col_has_default('public', 'users', 'language',        'users.language has default');
SELECT col_has_default('public', 'users', 'platform_role',   'users.platform_role has default');
SELECT col_has_default('public', 'users', 'created_at',      'users.created_at has default');
SELECT col_has_default('public', 'users', 'payment_methods', 'users.payment_methods has default');
SELECT col_has_default('public', 'users', 'app_lock_enabled','users.app_lock_enabled has default');

-- ---------------------------------------------------------------------------
-- 2. GROUPS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'groups', 'table groups exists');

SELECT has_column('public', 'groups', 'id',               'groups.id exists');
SELECT has_column('public', 'groups', 'name',             'groups.name exists');
SELECT has_column('public', 'groups', 'description',      'groups.description exists');
SELECT has_column('public', 'groups', 'photo_url',        'groups.photo_url exists');
SELECT has_column('public', 'groups', 'amount_per_round', 'groups.amount_per_round exists');
SELECT has_column('public', 'groups', 'frequency',        'groups.frequency exists');
SELECT has_column('public', 'groups', 'giliran_method',   'groups.giliran_method exists');
SELECT has_column('public', 'groups', 'start_date',       'groups.start_date exists');
SELECT has_column('public', 'groups', 'total_rounds',     'groups.total_rounds exists');
SELECT has_column('public', 'groups', 'status',           'groups.status exists');
SELECT has_column('public', 'groups', 'admin_id',         'groups.admin_id exists');
SELECT has_column('public', 'groups', 'created_at',       'groups.created_at exists');

SELECT col_type_is('public', 'groups', 'id',               'uuid',    'groups.id is uuid');
SELECT col_type_is('public', 'groups', 'name',             'text',    'groups.name is text');
SELECT col_type_is('public', 'groups', 'amount_per_round', 'bigint',  'groups.amount_per_round is bigint');
SELECT col_type_is('public', 'groups', 'frequency',        'text',    'groups.frequency is text');
SELECT col_type_is('public', 'groups', 'giliran_method',   'text',    'groups.giliran_method is text');
SELECT col_type_is('public', 'groups', 'start_date',       'date',    'groups.start_date is date');
SELECT col_type_is('public', 'groups', 'total_rounds',     'integer', 'groups.total_rounds is integer');
SELECT col_type_is('public', 'groups', 'status',           'text',    'groups.status is text');
SELECT col_type_is('public', 'groups', 'admin_id',         'uuid',    'groups.admin_id is uuid');

SELECT col_not_null('public', 'groups', 'id',               'groups.id NOT NULL');
SELECT col_not_null('public', 'groups', 'name',             'groups.name NOT NULL');
SELECT col_not_null('public', 'groups', 'amount_per_round', 'groups.amount_per_round NOT NULL');
SELECT col_not_null('public', 'groups', 'frequency',        'groups.frequency NOT NULL');
SELECT col_not_null('public', 'groups', 'giliran_method',   'groups.giliran_method NOT NULL');
SELECT col_not_null('public', 'groups', 'start_date',       'groups.start_date NOT NULL');
SELECT col_not_null('public', 'groups', 'total_rounds',     'groups.total_rounds NOT NULL');
SELECT col_not_null('public', 'groups', 'status',           'groups.status NOT NULL');
SELECT col_not_null('public', 'groups', 'admin_id',         'groups.admin_id NOT NULL');

SELECT col_has_default('public', 'groups', 'id',         'groups.id has default (gen_random_uuid)');
SELECT col_has_default('public', 'groups', 'status',     'groups.status has default');
SELECT col_has_default('public', 'groups', 'created_at', 'groups.created_at has default');

-- ---------------------------------------------------------------------------
-- 3. GROUP_MEMBERS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'group_members', 'table group_members exists');

SELECT has_column('public', 'group_members', 'id',            'group_members.id exists');
SELECT has_column('public', 'group_members', 'group_id',      'group_members.group_id exists');
SELECT has_column('public', 'group_members', 'user_id',       'group_members.user_id exists');
SELECT has_column('public', 'group_members', 'giliran_order', 'group_members.giliran_order exists');
SELECT has_column('public', 'group_members', 'group_role',    'group_members.group_role exists');
SELECT has_column('public', 'group_members', 'joined_at',     'group_members.joined_at exists');
-- migration-mvp.sql addition
SELECT has_column('public', 'group_members', 'member_name',   'group_members.member_name exists (migration-mvp)');

SELECT col_type_is('public', 'group_members', 'id',         'uuid', 'group_members.id is uuid');
SELECT col_type_is('public', 'group_members', 'group_id',   'uuid', 'group_members.group_id is uuid');
SELECT col_type_is('public', 'group_members', 'group_role', 'text', 'group_members.group_role is text');

SELECT col_not_null('public', 'group_members', 'id',         'group_members.id NOT NULL');
SELECT col_not_null('public', 'group_members', 'group_id',   'group_members.group_id NOT NULL');
SELECT col_not_null('public', 'group_members', 'group_role', 'group_members.group_role NOT NULL');
SELECT col_not_null('public', 'group_members', 'joined_at',  'group_members.joined_at NOT NULL');

-- ---------------------------------------------------------------------------
-- 4. ROUNDS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'rounds', 'table rounds exists');

SELECT has_column('public', 'rounds', 'id',             'rounds.id exists');
SELECT has_column('public', 'rounds', 'group_id',       'rounds.group_id exists');
SELECT has_column('public', 'rounds', 'round_number',   'rounds.round_number exists');
SELECT has_column('public', 'rounds', 'recipient_id',   'rounds.recipient_id exists');
SELECT has_column('public', 'rounds', 'scheduled_date', 'rounds.scheduled_date exists');
SELECT has_column('public', 'rounds', 'status',         'rounds.status exists');
SELECT has_column('public', 'rounds', 'completed_at',   'rounds.completed_at exists');
-- migration-mvp.sql addition
SELECT has_column('public', 'rounds', 'recipient_name', 'rounds.recipient_name exists (migration-mvp)');

SELECT col_type_is('public', 'rounds', 'id',             'uuid',    'rounds.id is uuid');
SELECT col_type_is('public', 'rounds', 'group_id',       'uuid',    'rounds.group_id is uuid');
SELECT col_type_is('public', 'rounds', 'round_number',   'integer', 'rounds.round_number is integer');
SELECT col_type_is('public', 'rounds', 'scheduled_date', 'date',    'rounds.scheduled_date is date');
SELECT col_type_is('public', 'rounds', 'status',         'text',    'rounds.status is text');

SELECT col_not_null('public', 'rounds', 'id',             'rounds.id NOT NULL');
SELECT col_not_null('public', 'rounds', 'group_id',       'rounds.group_id NOT NULL');
SELECT col_not_null('public', 'rounds', 'round_number',   'rounds.round_number NOT NULL');
SELECT col_not_null('public', 'rounds', 'scheduled_date', 'rounds.scheduled_date NOT NULL');
SELECT col_not_null('public', 'rounds', 'status',         'rounds.status NOT NULL');

-- ---------------------------------------------------------------------------
-- 5. PAYMENTS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'payments', 'table payments exists');

SELECT has_column('public', 'payments', 'id',               'payments.id exists');
SELECT has_column('public', 'payments', 'group_id',         'payments.group_id exists');
SELECT has_column('public', 'payments', 'round_id',         'payments.round_id exists');
SELECT has_column('public', 'payments', 'payer_id',         'payments.payer_id exists');
SELECT has_column('public', 'payments', 'amount',           'payments.amount exists');
SELECT has_column('public', 'payments', 'status',           'payments.status exists');
SELECT has_column('public', 'payments', 'proof_url',        'payments.proof_url exists');
SELECT has_column('public', 'payments', 'notes',            'payments.notes exists');
SELECT has_column('public', 'payments', 'rejection_reason', 'payments.rejection_reason exists');
SELECT has_column('public', 'payments', 'paid_at',          'payments.paid_at exists');
SELECT has_column('public', 'payments', 'confirmed_at',     'payments.confirmed_at exists');
SELECT has_column('public', 'payments', 'created_at',       'payments.created_at exists');
-- migration-mvp.sql addition
SELECT has_column('public', 'payments', 'payer_name',       'payments.payer_name exists (migration-mvp)');

SELECT col_type_is('public', 'payments', 'amount', 'bigint', 'payments.amount is bigint');
SELECT col_type_is('public', 'payments', 'status', 'text',   'payments.status is text');

SELECT col_not_null('public', 'payments', 'id',       'payments.id NOT NULL');
SELECT col_not_null('public', 'payments', 'group_id', 'payments.group_id NOT NULL');
SELECT col_not_null('public', 'payments', 'round_id', 'payments.round_id NOT NULL');
SELECT col_not_null('public', 'payments', 'amount',   'payments.amount NOT NULL');
SELECT col_not_null('public', 'payments', 'status',   'payments.status NOT NULL');

-- ---------------------------------------------------------------------------
-- 6. NOTIFICATIONS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'notifications', 'table notifications exists');

SELECT has_column('public', 'notifications', 'id',         'notifications.id exists');
SELECT has_column('public', 'notifications', 'user_id',    'notifications.user_id exists');
SELECT has_column('public', 'notifications', 'type',       'notifications.type exists');
SELECT has_column('public', 'notifications', 'title',      'notifications.title exists');
SELECT has_column('public', 'notifications', 'body',       'notifications.body exists');
SELECT has_column('public', 'notifications', 'metadata',   'notifications.metadata exists');
SELECT has_column('public', 'notifications', 'is_read',    'notifications.is_read exists');
SELECT has_column('public', 'notifications', 'created_at', 'notifications.created_at exists');

SELECT col_type_is('public', 'notifications', 'user_id',  'uuid',    'notifications.user_id is uuid');
SELECT col_type_is('public', 'notifications', 'metadata', 'jsonb',   'notifications.metadata is jsonb');
SELECT col_type_is('public', 'notifications', 'is_read',  'boolean', 'notifications.is_read is boolean');

SELECT col_not_null('public', 'notifications', 'id',         'notifications.id NOT NULL');
SELECT col_not_null('public', 'notifications', 'user_id',    'notifications.user_id NOT NULL');
SELECT col_not_null('public', 'notifications', 'type',       'notifications.type NOT NULL');
SELECT col_not_null('public', 'notifications', 'title',      'notifications.title NOT NULL');
SELECT col_not_null('public', 'notifications', 'body',       'notifications.body NOT NULL');
SELECT col_not_null('public', 'notifications', 'is_read',    'notifications.is_read NOT NULL');

-- ---------------------------------------------------------------------------
-- 7. BILLS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'bills', 'table bills exists');

SELECT has_column('public', 'bills', 'id',                 'bills.id exists');
SELECT has_column('public', 'bills', 'title',              'bills.title exists');
SELECT has_column('public', 'bills', 'description',        'bills.description exists');
SELECT has_column('public', 'bills', 'category',           'bills.category exists');
SELECT has_column('public', 'bills', 'total_amount',       'bills.total_amount exists');
SELECT has_column('public', 'bills', 'currency',           'bills.currency exists');
SELECT has_column('public', 'bills', 'paid_by',            'bills.paid_by exists');
SELECT has_column('public', 'bills', 'split_method',       'bills.split_method exists');
SELECT has_column('public', 'bills', 'receipt_url',        'bills.receipt_url exists');
SELECT has_column('public', 'bills', 'status',             'bills.status exists');
SELECT has_column('public', 'bills', 'group_id',           'bills.group_id exists');
SELECT has_column('public', 'bills', 'created_at',         'bills.created_at exists');
SELECT has_column('public', 'bills', 'settled_at',         'bills.settled_at exists');
-- schema.sql v3 addition (recurring_bills link)
SELECT has_column('public', 'bills', 'recurring_bill_id',  'bills.recurring_bill_id exists');

SELECT col_type_is('public', 'bills', 'total_amount', 'bigint', 'bills.total_amount is bigint');
SELECT col_type_is('public', 'bills', 'paid_by',      'uuid',   'bills.paid_by is uuid');

SELECT col_not_null('public', 'bills', 'id',           'bills.id NOT NULL');
SELECT col_not_null('public', 'bills', 'title',        'bills.title NOT NULL');
SELECT col_not_null('public', 'bills', 'total_amount', 'bills.total_amount NOT NULL');
SELECT col_not_null('public', 'bills', 'currency',     'bills.currency NOT NULL');
SELECT col_not_null('public', 'bills', 'paid_by',      'bills.paid_by NOT NULL');
SELECT col_not_null('public', 'bills', 'split_method', 'bills.split_method NOT NULL');
SELECT col_not_null('public', 'bills', 'status',       'bills.status NOT NULL');

-- ---------------------------------------------------------------------------
-- 8. BILL_PARTICIPANTS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'bill_participants', 'table bill_participants exists');

SELECT has_column('public', 'bill_participants', 'id',               'bill_participants.id exists');
SELECT has_column('public', 'bill_participants', 'bill_id',          'bill_participants.bill_id exists');
SELECT has_column('public', 'bill_participants', 'user_id',          'bill_participants.user_id exists');
SELECT has_column('public', 'bill_participants', 'shares',           'bill_participants.shares exists');
SELECT has_column('public', 'bill_participants', 'percentage',       'bill_participants.percentage exists');
SELECT has_column('public', 'bill_participants', 'added_at',         'bill_participants.added_at exists');
-- migration-mvp.sql addition
SELECT has_column('public', 'bill_participants', 'participant_name', 'bill_participants.participant_name exists (migration-mvp)');

SELECT col_type_is('public', 'bill_participants', 'bill_id',    'uuid',          'bill_participants.bill_id is uuid');
SELECT col_type_is('public', 'bill_participants', 'shares',     'integer',       'bill_participants.shares is integer');
SELECT col_type_is('public', 'bill_participants', 'percentage', 'numeric',       'bill_participants.percentage is numeric');

-- ---------------------------------------------------------------------------
-- 9. BILL_SPLITS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'bill_splits', 'table bill_splits exists');

SELECT has_column('public', 'bill_splits', 'id',               'bill_splits.id exists');
SELECT has_column('public', 'bill_splits', 'bill_id',          'bill_splits.bill_id exists');
SELECT has_column('public', 'bill_splits', 'participant_id',   'bill_splits.participant_id exists');
SELECT has_column('public', 'bill_splits', 'user_id',          'bill_splits.user_id exists');
SELECT has_column('public', 'bill_splits', 'amount_owed',      'bill_splits.amount_owed exists');
SELECT has_column('public', 'bill_splits', 'is_payer',         'bill_splits.is_payer exists');
SELECT has_column('public', 'bill_splits', 'created_at',       'bill_splits.created_at exists');
-- migration-mvp.sql additions
SELECT has_column('public', 'bill_splits', 'participant_name', 'bill_splits.participant_name exists (migration-mvp)');
SELECT has_column('public', 'bill_splits', 'is_settled',       'bill_splits.is_settled exists (migration-mvp)');
SELECT has_column('public', 'bill_splits', 'settled_at',       'bill_splits.settled_at exists (migration-mvp)');

SELECT col_type_is('public', 'bill_splits', 'amount_owed', 'bigint',  'bill_splits.amount_owed is bigint');
SELECT col_type_is('public', 'bill_splits', 'is_payer',    'boolean', 'bill_splits.is_payer is boolean');
SELECT col_type_is('public', 'bill_splits', 'is_settled',  'boolean', 'bill_splits.is_settled is boolean');

SELECT col_not_null('public', 'bill_splits', 'amount_owed', 'bill_splits.amount_owed NOT NULL');
SELECT col_not_null('public', 'bill_splits', 'is_payer',    'bill_splits.is_payer NOT NULL');
SELECT col_not_null('public', 'bill_splits', 'is_settled',  'bill_splits.is_settled NOT NULL');

-- ---------------------------------------------------------------------------
-- 10. BILL_SETTLEMENTS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'bill_settlements', 'table bill_settlements exists');

SELECT has_column('public', 'bill_settlements', 'id',           'bill_settlements.id exists');
SELECT has_column('public', 'bill_settlements', 'bill_id',      'bill_settlements.bill_id exists');
SELECT has_column('public', 'bill_settlements', 'payer_id',     'bill_settlements.payer_id exists');
SELECT has_column('public', 'bill_settlements', 'receiver_id',  'bill_settlements.receiver_id exists');
SELECT has_column('public', 'bill_settlements', 'amount',       'bill_settlements.amount exists');
SELECT has_column('public', 'bill_settlements', 'proof_url',    'bill_settlements.proof_url exists');
SELECT has_column('public', 'bill_settlements', 'status',       'bill_settlements.status exists');
SELECT has_column('public', 'bill_settlements', 'settled_at',   'bill_settlements.settled_at exists');
SELECT has_column('public', 'bill_settlements', 'confirmed_at', 'bill_settlements.confirmed_at exists');
SELECT has_column('public', 'bill_settlements', 'created_at',   'bill_settlements.created_at exists');

SELECT col_type_is('public', 'bill_settlements', 'amount', 'bigint', 'bill_settlements.amount is bigint');
SELECT col_not_null('public', 'bill_settlements', 'amount', 'bill_settlements.amount NOT NULL');
SELECT col_not_null('public', 'bill_settlements', 'status', 'bill_settlements.status NOT NULL');

-- ---------------------------------------------------------------------------
-- 11. INVITE_LINKS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'invite_links', 'table invite_links exists');

SELECT has_column('public', 'invite_links', 'id',         'invite_links.id exists');
SELECT has_column('public', 'invite_links', 'token',      'invite_links.token exists');
SELECT has_column('public', 'invite_links', 'group_id',   'invite_links.group_id exists');
SELECT has_column('public', 'invite_links', 'created_by', 'invite_links.created_by exists');
SELECT has_column('public', 'invite_links', 'max_uses',   'invite_links.max_uses exists');
SELECT has_column('public', 'invite_links', 'use_count',  'invite_links.use_count exists');
SELECT has_column('public', 'invite_links', 'expires_at', 'invite_links.expires_at exists');
SELECT has_column('public', 'invite_links', 'is_active',  'invite_links.is_active exists');
SELECT has_column('public', 'invite_links', 'created_at', 'invite_links.created_at exists');

SELECT col_not_null('public', 'invite_links', 'token',     'invite_links.token NOT NULL');
SELECT col_not_null('public', 'invite_links', 'group_id',  'invite_links.group_id NOT NULL');
SELECT col_not_null('public', 'invite_links', 'use_count', 'invite_links.use_count NOT NULL');
SELECT col_not_null('public', 'invite_links', 'is_active', 'invite_links.is_active NOT NULL');

-- ---------------------------------------------------------------------------
-- 12. USER_CONTACTS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'user_contacts', 'table user_contacts exists');

SELECT has_column('public', 'user_contacts', 'id',           'user_contacts.id exists');
SELECT has_column('public', 'user_contacts', 'owner_id',     'user_contacts.owner_id exists');
SELECT has_column('public', 'user_contacts', 'contact_id',   'user_contacts.contact_id exists');
SELECT has_column('public', 'user_contacts', 'name',         'user_contacts.name exists');
SELECT has_column('public', 'user_contacts', 'phone',        'user_contacts.phone exists');
SELECT has_column('public', 'user_contacts', 'last_used_at', 'user_contacts.last_used_at exists');
SELECT has_column('public', 'user_contacts', 'use_count',    'user_contacts.use_count exists');
SELECT has_column('public', 'user_contacts', 'created_at',   'user_contacts.created_at exists');

SELECT col_not_null('public', 'user_contacts', 'owner_id',  'user_contacts.owner_id NOT NULL');
SELECT col_not_null('public', 'user_contacts', 'name',      'user_contacts.name NOT NULL');
SELECT col_not_null('public', 'user_contacts', 'use_count', 'user_contacts.use_count NOT NULL');

-- ---------------------------------------------------------------------------
-- 13. BANK_ACCOUNTS (migration-c2-c3)
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'bank_accounts', 'table bank_accounts exists');

SELECT has_column('public', 'bank_accounts', 'id',             'bank_accounts.id exists');
SELECT has_column('public', 'bank_accounts', 'user_id',        'bank_accounts.user_id exists');
SELECT has_column('public', 'bank_accounts', 'bank',           'bank_accounts.bank exists');
SELECT has_column('public', 'bank_accounts', 'account_number', 'bank_accounts.account_number exists');
SELECT has_column('public', 'bank_accounts', 'holder_name',    'bank_accounts.holder_name exists');
SELECT has_column('public', 'bank_accounts', 'created_at',     'bank_accounts.created_at exists');
SELECT has_column('public', 'bank_accounts', 'updated_at',     'bank_accounts.updated_at exists');

SELECT col_not_null('public', 'bank_accounts', 'user_id',        'bank_accounts.user_id NOT NULL');
SELECT col_not_null('public', 'bank_accounts', 'bank',           'bank_accounts.bank NOT NULL');
SELECT col_not_null('public', 'bank_accounts', 'account_number', 'bank_accounts.account_number NOT NULL');
SELECT col_not_null('public', 'bank_accounts', 'holder_name',    'bank_accounts.holder_name NOT NULL');

-- ---------------------------------------------------------------------------
-- 14. PLANS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'plans', 'table plans exists');

SELECT has_column('public', 'plans', 'id',                    'plans.id exists');
SELECT has_column('public', 'plans', 'slug',                  'plans.slug exists');
SELECT has_column('public', 'plans', 'name',                  'plans.name exists');
SELECT has_column('public', 'plans', 'price_monthly',         'plans.price_monthly exists');
SELECT has_column('public', 'plans', 'price_yearly',          'plans.price_yearly exists');
SELECT has_column('public', 'plans', 'max_groups',            'plans.max_groups exists');
SELECT has_column('public', 'plans', 'max_members_per_group', 'plans.max_members_per_group exists');
SELECT has_column('public', 'plans', 'max_bills_per_month',   'plans.max_bills_per_month exists');
SELECT has_column('public', 'plans', 'recurring_bills',       'plans.recurring_bills exists');
SELECT has_column('public', 'plans', 'analytics_access',      'plans.analytics_access exists');
SELECT has_column('public', 'plans', 'pdf_export',            'plans.pdf_export exists');
SELECT has_column('public', 'plans', 'debt_simplification',   'plans.debt_simplification exists');
SELECT has_column('public', 'plans', 'custom_invite_links',   'plans.custom_invite_links exists');
SELECT has_column('public', 'plans', 'priority_support',      'plans.priority_support exists');
SELECT has_column('public', 'plans', 'white_label',           'plans.white_label exists');
SELECT has_column('public', 'plans', 'is_active',             'plans.is_active exists');

SELECT col_type_is('public', 'plans', 'price_monthly', 'bigint', 'plans.price_monthly is bigint');
SELECT col_type_is('public', 'plans', 'price_yearly',  'bigint', 'plans.price_yearly is bigint');
SELECT col_type_is('public', 'plans', 'slug',          'text',   'plans.slug is text');

SELECT col_not_null('public', 'plans', 'slug',          'plans.slug NOT NULL');
SELECT col_not_null('public', 'plans', 'name',          'plans.name NOT NULL');
SELECT col_not_null('public', 'plans', 'price_monthly', 'plans.price_monthly NOT NULL');
SELECT col_not_null('public', 'plans', 'price_yearly',  'plans.price_yearly NOT NULL');
SELECT col_not_null('public', 'plans', 'is_active',     'plans.is_active NOT NULL');

-- ---------------------------------------------------------------------------
-- 15. USER_SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'user_subscriptions', 'table user_subscriptions exists');

SELECT has_column('public', 'user_subscriptions', 'id',                    'user_subscriptions.id exists');
SELECT has_column('public', 'user_subscriptions', 'user_id',               'user_subscriptions.user_id exists');
SELECT has_column('public', 'user_subscriptions', 'plan_id',               'user_subscriptions.plan_id exists');
SELECT has_column('public', 'user_subscriptions', 'billing_cycle',         'user_subscriptions.billing_cycle exists');
SELECT has_column('public', 'user_subscriptions', 'status',                'user_subscriptions.status exists');
SELECT has_column('public', 'user_subscriptions', 'gateway',               'user_subscriptions.gateway exists');
SELECT has_column('public', 'user_subscriptions', 'current_period_end',    'user_subscriptions.current_period_end exists');
SELECT has_column('public', 'user_subscriptions', 'cancelled_at',          'user_subscriptions.cancelled_at exists');

SELECT col_not_null('public', 'user_subscriptions', 'user_id',            'user_subscriptions.user_id NOT NULL');
SELECT col_not_null('public', 'user_subscriptions', 'plan_id',            'user_subscriptions.plan_id NOT NULL');
SELECT col_not_null('public', 'user_subscriptions', 'billing_cycle',      'user_subscriptions.billing_cycle NOT NULL');
SELECT col_not_null('public', 'user_subscriptions', 'status',             'user_subscriptions.status NOT NULL');
SELECT col_not_null('public', 'user_subscriptions', 'current_period_end', 'user_subscriptions.current_period_end NOT NULL');

-- ---------------------------------------------------------------------------
-- 16. GROUP_SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'group_subscriptions', 'table group_subscriptions exists');

SELECT has_column('public', 'group_subscriptions', 'group_id',           'group_subscriptions.group_id exists');
SELECT has_column('public', 'group_subscriptions', 'paid_by',            'group_subscriptions.paid_by exists');
SELECT has_column('public', 'group_subscriptions', 'plan_id',            'group_subscriptions.plan_id exists');
SELECT has_column('public', 'group_subscriptions', 'billing_cycle',      'group_subscriptions.billing_cycle exists');
SELECT has_column('public', 'group_subscriptions', 'status',             'group_subscriptions.status exists');
SELECT has_column('public', 'group_subscriptions', 'current_period_end', 'group_subscriptions.current_period_end exists');

SELECT col_not_null('public', 'group_subscriptions', 'group_id',           'group_subscriptions.group_id NOT NULL');
SELECT col_not_null('public', 'group_subscriptions', 'paid_by',            'group_subscriptions.paid_by NOT NULL');
SELECT col_not_null('public', 'group_subscriptions', 'plan_id',            'group_subscriptions.plan_id NOT NULL');
SELECT col_not_null('public', 'group_subscriptions', 'billing_cycle',      'group_subscriptions.billing_cycle NOT NULL');
SELECT col_not_null('public', 'group_subscriptions', 'status',             'group_subscriptions.status NOT NULL');
SELECT col_not_null('public', 'group_subscriptions', 'current_period_end', 'group_subscriptions.current_period_end NOT NULL');

-- ---------------------------------------------------------------------------
-- 17. PAYMENT_TRANSACTIONS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'payment_transactions', 'table payment_transactions exists');

SELECT has_column('public', 'payment_transactions', 'id',              'payment_transactions.id exists');
SELECT has_column('public', 'payment_transactions', 'user_id',         'payment_transactions.user_id exists');
SELECT has_column('public', 'payment_transactions', 'type',            'payment_transactions.type exists');
SELECT has_column('public', 'payment_transactions', 'gateway',         'payment_transactions.gateway exists');
SELECT has_column('public', 'payment_transactions', 'gateway_tx_id',   'payment_transactions.gateway_tx_id exists');
SELECT has_column('public', 'payment_transactions', 'gateway_status',  'payment_transactions.gateway_status exists');
SELECT has_column('public', 'payment_transactions', 'amount',          'payment_transactions.amount exists');
SELECT has_column('public', 'payment_transactions', 'currency',        'payment_transactions.currency exists');
SELECT has_column('public', 'payment_transactions', 'status',          'payment_transactions.status exists');
SELECT has_column('public', 'payment_transactions', 'gateway_payload', 'payment_transactions.gateway_payload exists');

SELECT col_type_is('public', 'payment_transactions', 'amount',          'bigint', 'payment_transactions.amount is bigint');
SELECT col_type_is('public', 'payment_transactions', 'gateway_payload', 'jsonb',  'payment_transactions.gateway_payload is jsonb');

SELECT col_not_null('public', 'payment_transactions', 'user_id',  'payment_transactions.user_id NOT NULL');
SELECT col_not_null('public', 'payment_transactions', 'type',     'payment_transactions.type NOT NULL');
SELECT col_not_null('public', 'payment_transactions', 'gateway',  'payment_transactions.gateway NOT NULL');
SELECT col_not_null('public', 'payment_transactions', 'amount',   'payment_transactions.amount NOT NULL');
SELECT col_not_null('public', 'payment_transactions', 'status',   'payment_transactions.status NOT NULL');

-- ---------------------------------------------------------------------------
-- 18. USAGE_TRACKING
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'usage_tracking', 'table usage_tracking exists');

SELECT has_column('public', 'usage_tracking', 'id',             'usage_tracking.id exists');
SELECT has_column('public', 'usage_tracking', 'user_id',        'usage_tracking.user_id exists');
SELECT has_column('public', 'usage_tracking', 'period_month',   'usage_tracking.period_month exists');
SELECT has_column('public', 'usage_tracking', 'groups_created', 'usage_tracking.groups_created exists');
SELECT has_column('public', 'usage_tracking', 'bills_created',  'usage_tracking.bills_created exists');
SELECT has_column('public', 'usage_tracking', 'updated_at',     'usage_tracking.updated_at exists');

SELECT col_type_is('public', 'usage_tracking', 'period_month', 'date', 'usage_tracking.period_month is date');

SELECT col_not_null('public', 'usage_tracking', 'user_id',        'usage_tracking.user_id NOT NULL');
SELECT col_not_null('public', 'usage_tracking', 'period_month',   'usage_tracking.period_month NOT NULL');
SELECT col_not_null('public', 'usage_tracking', 'groups_created', 'usage_tracking.groups_created NOT NULL');
SELECT col_not_null('public', 'usage_tracking', 'bills_created',  'usage_tracking.bills_created NOT NULL');

-- ---------------------------------------------------------------------------
-- 19. BILL_COMMENTS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'bill_comments', 'table bill_comments exists');

SELECT has_column('public', 'bill_comments', 'id',         'bill_comments.id exists');
SELECT has_column('public', 'bill_comments', 'bill_id',    'bill_comments.bill_id exists');
SELECT has_column('public', 'bill_comments', 'user_id',    'bill_comments.user_id exists');
SELECT has_column('public', 'bill_comments', 'body',       'bill_comments.body exists');
SELECT has_column('public', 'bill_comments', 'parent_id',  'bill_comments.parent_id exists');
SELECT has_column('public', 'bill_comments', 'deleted_at', 'bill_comments.deleted_at exists');
SELECT has_column('public', 'bill_comments', 'created_at', 'bill_comments.created_at exists');
SELECT has_column('public', 'bill_comments', 'updated_at', 'bill_comments.updated_at exists');

SELECT col_not_null('public', 'bill_comments', 'bill_id',    'bill_comments.bill_id NOT NULL');
SELECT col_not_null('public', 'bill_comments', 'user_id',    'bill_comments.user_id NOT NULL');
SELECT col_not_null('public', 'bill_comments', 'body',       'bill_comments.body NOT NULL');
SELECT col_not_null('public', 'bill_comments', 'created_at', 'bill_comments.created_at NOT NULL');
SELECT col_not_null('public', 'bill_comments', 'updated_at', 'bill_comments.updated_at NOT NULL');

-- ---------------------------------------------------------------------------
-- 20. RECURRING_BILLS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'recurring_bills', 'table recurring_bills exists');

SELECT has_column('public', 'recurring_bills', 'id',            'recurring_bills.id exists');
SELECT has_column('public', 'recurring_bills', 'title',         'recurring_bills.title exists');
SELECT has_column('public', 'recurring_bills', 'total_amount',  'recurring_bills.total_amount exists');
SELECT has_column('public', 'recurring_bills', 'paid_by',       'recurring_bills.paid_by exists');
SELECT has_column('public', 'recurring_bills', 'split_method',  'recurring_bills.split_method exists');
SELECT has_column('public', 'recurring_bills', 'frequency',     'recurring_bills.frequency exists');
SELECT has_column('public', 'recurring_bills', 'start_date',    'recurring_bills.start_date exists');
SELECT has_column('public', 'recurring_bills', 'next_due_date', 'recurring_bills.next_due_date exists');
SELECT has_column('public', 'recurring_bills', 'is_active',     'recurring_bills.is_active exists');
SELECT has_column('public', 'recurring_bills', 'participants',  'recurring_bills.participants exists');

SELECT col_type_is('public', 'recurring_bills', 'total_amount', 'bigint',  'recurring_bills.total_amount is bigint');
SELECT col_type_is('public', 'recurring_bills', 'participants', 'jsonb',   'recurring_bills.participants is jsonb');
SELECT col_type_is('public', 'recurring_bills', 'is_active',    'boolean', 'recurring_bills.is_active is boolean');

SELECT col_not_null('public', 'recurring_bills', 'title',         'recurring_bills.title NOT NULL');
SELECT col_not_null('public', 'recurring_bills', 'total_amount',  'recurring_bills.total_amount NOT NULL');
SELECT col_not_null('public', 'recurring_bills', 'paid_by',       'recurring_bills.paid_by NOT NULL');
SELECT col_not_null('public', 'recurring_bills', 'frequency',     'recurring_bills.frequency NOT NULL');
SELECT col_not_null('public', 'recurring_bills', 'next_due_date', 'recurring_bills.next_due_date NOT NULL');

-- ---------------------------------------------------------------------------
-- 21. DEBT_SIMPLIFICATIONS
-- ---------------------------------------------------------------------------
SELECT has_table('public', 'debt_simplifications', 'table debt_simplifications exists');

SELECT has_column('public', 'debt_simplifications', 'id',           'debt_simplifications.id exists');
SELECT has_column('public', 'debt_simplifications', 'bill_id',      'debt_simplifications.bill_id exists');
SELECT has_column('public', 'debt_simplifications', 'from_user_id', 'debt_simplifications.from_user_id exists');
SELECT has_column('public', 'debt_simplifications', 'to_user_id',   'debt_simplifications.to_user_id exists');
SELECT has_column('public', 'debt_simplifications', 'amount',       'debt_simplifications.amount exists');
SELECT has_column('public', 'debt_simplifications', 'status',       'debt_simplifications.status exists');
SELECT has_column('public', 'debt_simplifications', 'chain',        'debt_simplifications.chain exists');

SELECT col_type_is('public', 'debt_simplifications', 'amount', 'bigint', 'debt_simplifications.amount is bigint');
SELECT col_type_is('public', 'debt_simplifications', 'chain',  'jsonb',  'debt_simplifications.chain is jsonb');

SELECT col_not_null('public', 'debt_simplifications', 'bill_id',      'debt_simplifications.bill_id NOT NULL');
SELECT col_not_null('public', 'debt_simplifications', 'from_user_id', 'debt_simplifications.from_user_id NOT NULL');
SELECT col_not_null('public', 'debt_simplifications', 'to_user_id',   'debt_simplifications.to_user_id NOT NULL');
SELECT col_not_null('public', 'debt_simplifications', 'amount',       'debt_simplifications.amount NOT NULL');
SELECT col_not_null('public', 'debt_simplifications', 'status',       'debt_simplifications.status NOT NULL');

SELECT * FROM finish();
ROLLBACK;
