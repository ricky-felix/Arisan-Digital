-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
-- This file defines security policies to control data access at the row level.
-- RLS ensures users can only access data they're authorized to see.
--
-- To apply these policies:
-- 1. First apply schema.sql
-- 2. Then apply this file in the Supabase SQL Editor
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
-- By default, when RLS is enabled, no rows are accessible.
-- We must explicitly grant access through policies.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Policy: Users can view profiles of other group members
CREATE POLICY "Users can view group members profiles"
  ON users
  FOR SELECT
  USING (
    id IN (
      SELECT gm.user_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id
        FROM group_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- GROUPS TABLE POLICIES
-- =====================================================

-- Policy: Users can read groups they are members of
CREATE POLICY "Users can view their groups"
  ON groups
  FOR SELECT
  USING (
    id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy: Only group admins can update groups
CREATE POLICY "Group admins can update groups"
  ON groups
  FOR UPDATE
  USING (
    id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  )
  WITH CHECK (
    id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy: Only group admins can delete groups
CREATE POLICY "Group admins can delete groups"
  ON groups
  FOR DELETE
  USING (
    id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- =====================================================
-- GROUP_MEMBERS TABLE POLICIES
-- =====================================================

-- Policy: Users can view members of groups they belong to
CREATE POLICY "Users can view group members"
  ON group_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can join groups (insert themselves)
CREATE POLICY "Users can join groups"
  ON group_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Group admins can add members to their groups
CREATE POLICY "Group admins can add members"
  ON group_members
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy: Group admins can update member roles
CREATE POLICY "Group admins can update members"
  ON group_members
  FOR UPDATE
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy: Users can remove themselves from groups
CREATE POLICY "Users can leave groups"
  ON group_members
  FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Group admins can remove members
CREATE POLICY "Group admins can remove members"
  ON group_members
  FOR DELETE
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- =====================================================
-- ROUNDS TABLE POLICIES
-- =====================================================

-- Policy: Group members can view rounds for their groups
CREATE POLICY "Group members can view rounds"
  ON rounds
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Group admins can create rounds
CREATE POLICY "Group admins can create rounds"
  ON rounds
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy: Group admins can update rounds
CREATE POLICY "Group admins can update rounds"
  ON rounds
  FOR UPDATE
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- Policy: Group admins can delete rounds
CREATE POLICY "Group admins can delete rounds"
  ON rounds
  FOR DELETE
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
        AND is_admin = true
    )
  );

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Policy: Users can view payments for rounds in their groups
CREATE POLICY "Group members can view payments"
  ON payments
  FOR SELECT
  USING (
    round_id IN (
      SELECT r.id
      FROM rounds r
      WHERE r.group_id IN (
        SELECT group_id
        FROM group_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can create their own payments
CREATE POLICY "Users can create their own payments"
  ON payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own payments (until marked as paid)
CREATE POLICY "Users can update their own payments"
  ON payments
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- Policy: Group admins can update any payment in their groups
CREATE POLICY "Group admins can update payments"
  ON payments
  FOR UPDATE
  USING (
    round_id IN (
      SELECT r.id
      FROM rounds r
      WHERE r.group_id IN (
        SELECT group_id
        FROM group_members
        WHERE user_id = auth.uid()
          AND is_admin = true
      )
    )
  )
  WITH CHECK (
    round_id IN (
      SELECT r.id
      FROM rounds r
      WHERE r.group_id IN (
        SELECT group_id
        FROM group_members
        WHERE user_id = auth.uid()
          AND is_admin = true
      )
    )
  );

-- Policy: Users can delete their own pending payments
CREATE POLICY "Users can delete their own pending payments"
  ON payments
  FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');

-- Policy: Group admins can delete payments in their groups
CREATE POLICY "Group admins can delete payments"
  ON payments
  FOR DELETE
  USING (
    round_id IN (
      SELECT r.id
      FROM rounds r
      WHERE r.group_id IN (
        SELECT group_id
        FROM group_members
        WHERE user_id = auth.uid()
          AND is_admin = true
      )
    )
  );

-- =====================================================
-- HELPER COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view their own profile" ON users IS
  'Allows users to read their own profile information';

COMMENT ON POLICY "Users can view their groups" ON groups IS
  'Users can only see groups where they are members';

COMMENT ON POLICY "Group admins can update groups" ON groups IS
  'Only users with is_admin=true can modify group details';

COMMENT ON POLICY "Group members can view rounds" ON rounds IS
  'Members can see all rounds for groups they belong to';

COMMENT ON POLICY "Users can create their own payments" ON payments IS
  'Users can submit payment records for rounds in their groups';
