-- ============================================================
-- Arisan Digital — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- Extends auth.users with app-specific user data.
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT        NOT NULL,
  phone         TEXT,
  avatar_initials TEXT      GENERATED ALWAYS AS (
    upper(left(full_name, 1)) ||
    upper(left(split_part(full_name, ' ', 2), 1))
  ) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. GROUPS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  description   TEXT,
  amount        BIGINT      NOT NULL CHECK (amount > 0),  -- iuran per putaran (IDR)
  total_rounds  INT         NOT NULL CHECK (total_rounds > 0),
  current_round INT         NOT NULL DEFAULT 1,
  color         TEXT        NOT NULL DEFAULT '#10b981',
  invite_code   TEXT        UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 8)),
  created_by    UUID        NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. GROUP MEMBERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position    INT         NOT NULL CHECK (position > 0),  -- giliran ke-N
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id),
  UNIQUE (group_id, position)
);

-- ── 4. PAYMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  round_number INT         NOT NULL,
  amount       BIGINT      NOT NULL,
  type         TEXT        NOT NULL CHECK (type IN ('bayar', 'terima')),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'lunas', 'terlambat')),
  method       TEXT        CHECK (method IN ('Transfer Bank', 'QRIS', 'Tunai')),
  due_date     DATE,
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own
CREATE POLICY "profiles: own read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- groups: members can read; creator can insert/update/delete
CREATE POLICY "groups: members read" ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );
CREATE POLICY "groups: creator insert" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "groups: creator update" ON public.groups FOR UPDATE
  USING (created_by = auth.uid());
CREATE POLICY "groups: creator delete" ON public.groups FOR DELETE
  USING (created_by = auth.uid());

-- group_members: members of the same group can read; own insert/delete
CREATE POLICY "group_members: group read" ON public.group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm2
      WHERE gm2.group_id = group_members.group_id AND gm2.user_id = auth.uid()
    )
  );
CREATE POLICY "group_members: self insert" ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "group_members: self delete" ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- payments: own read/insert; group creator can insert for others (payout)
CREATE POLICY "payments: own read" ON public.payments FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "payments: own insert" ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "payments: own update" ON public.payments FOR UPDATE
  USING (user_id = auth.uid());

-- notifications: own only
CREATE POLICY "notifications: own" ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- ── 7. HELPFUL INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_members_user   ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group  ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_user        ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_group       ON public.payments(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date    ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id);

-- ── 8. UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
