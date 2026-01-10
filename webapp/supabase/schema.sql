-- =====================================================
-- Arisan Digital Database Schema
-- =====================================================
-- This schema defines the core tables for the Arisan Digital application.
-- An arisan is a traditional Indonesian rotating savings group where members
-- contribute regularly and take turns receiving the pooled funds.
--
-- To apply this schema:
-- 1. Open your Supabase Dashboard SQL Editor
-- 2. Copy and paste this entire file
-- 3. Execute the query
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Stores user profile information.
-- Each user is identified by their phone number (common in Indonesia).

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster phone number lookups (used for authentication)
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- =====================================================
-- GROUPS TABLE
-- =====================================================
-- Stores arisan group information.
-- Each group has a fixed contribution amount, frequency, and member count.

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contribution_amount INTEGER NOT NULL CHECK (contribution_amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  member_count INTEGER NOT NULL CHECK (member_count > 0),
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by creator
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);

-- =====================================================
-- GROUP_MEMBERS TABLE
-- =====================================================
-- Junction table connecting users to groups.
-- Tracks which users belong to which groups and their admin status.

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT false,

  -- Ensure a user can only join a group once
  UNIQUE(group_id, user_id)
);

-- Index for faster queries by group
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Index for finding group admins
CREATE INDEX IF NOT EXISTS idx_group_members_is_admin ON group_members(group_id, is_admin);

-- =====================================================
-- ROUNDS TABLE
-- =====================================================
-- Stores information about each arisan round.
-- Each round has a winner who receives the pooled contributions.

CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  payment_deadline DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Ensure round numbers are unique within a group
  UNIQUE(group_id, round_number)
);

-- Index for faster queries by group
CREATE INDEX IF NOT EXISTS idx_rounds_group_id ON rounds(group_id);

-- Index for finding rounds by winner
CREATE INDEX IF NOT EXISTS idx_rounds_winner_id ON rounds(winner_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(group_id, status);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
-- Tracks individual member payments for each round.
-- Members upload proof of payment which admins can verify.

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMP WITH TIME ZONE,
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by round
CREATE INDEX IF NOT EXISTS idx_payments_round_id ON payments(round_id);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(round_id, status);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Function to automatically update the updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply the trigger to groups table
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Stores user profile information';
COMMENT ON TABLE groups IS 'Stores arisan group information with contribution details';
COMMENT ON TABLE group_members IS 'Junction table linking users to groups';
COMMENT ON TABLE rounds IS 'Stores information about each arisan round and its winner';
COMMENT ON TABLE payments IS 'Tracks member payments for each round';

COMMENT ON COLUMN groups.contribution_amount IS 'Amount in IDR (Indonesian Rupiah) that each member contributes per round';
COMMENT ON COLUMN groups.frequency IS 'How often rounds occur (weekly or monthly)';
COMMENT ON COLUMN groups.member_count IS 'Total number of members in the group';
COMMENT ON COLUMN rounds.round_number IS 'Sequential round number within the group (1, 2, 3, ...)';
COMMENT ON COLUMN rounds.winner_id IS 'User who receives the pooled funds for this round';
COMMENT ON COLUMN payments.proof_url IS 'URL to uploaded payment proof image/document';
