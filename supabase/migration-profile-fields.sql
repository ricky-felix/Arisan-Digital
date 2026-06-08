-- ============================================================================
-- Migration: extra profile fields (gender, payment methods)
-- ----------------------------------------------------------------------------
-- Adds optional profile + payout-preference fields surfaced on the Edit Profil
-- screen. Apply in Supabase → SQL Editor. Idempotent: safe to run repeatedly.
-- ============================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('male', 'female'));

-- payment_methods: list of method ids the user accepts, e.g. ["qris","gopay","bca"]
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb;
