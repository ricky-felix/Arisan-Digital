-- ============================================================
-- Arisan Digital — Supabase Schema  (full replacement)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 0. EXTENSIONS ────────────────────────────────────────────
-- gen_random_uuid() and pg_trgm for invite-code search
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 1. PROFILES ──────────────────────────────────────────────
-- Extends auth.users with app-specific data.
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT        NOT NULL,
  phone               TEXT,
  avatar_url          TEXT,                           -- optional custom avatar
  -- computed initials for the Avatar component (e.g. "SW")
  avatar_initials     TEXT        GENERATED ALWAYS AS (
    upper(left(full_name, 1)) ||
    upper(left(split_part(full_name, ' ', 2), 1))
  ) STORED,
  -- per-user notification preferences (mirrors ProfilPage toggles)
  notification_prefs  JSONB       NOT NULL DEFAULT '{"bill":true,"confirmed":true,"marketing":false}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
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
  amount        BIGINT      NOT NULL CHECK (amount > 0),        -- iuran per ronde (IDR)
  frequency     TEXT        NOT NULL DEFAULT 'Bulanan'
                            CHECK (frequency IN ('Mingguan', 'Dua Minggu', 'Bulanan', 'Tahunan')),
  method        TEXT        NOT NULL DEFAULT 'Manual'
                            CHECK (method IN ('Manual', 'Undian Acak')),
  total_rounds  INT         NOT NULL CHECK (total_rounds > 0),
  current_round INT         NOT NULL DEFAULT 1 CHECK (current_round >= 1),
  status        TEXT        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'paused', 'completed')),
  color         TEXT        NOT NULL DEFAULT '#10b981',
  -- short invite code shown in the join-by-code sheet (e.g. "SARI-K3X9")
  invite_code   TEXT        UNIQUE NOT NULL
                            DEFAULT upper(substr(md5(gen_random_uuid()::text), 1, 4) || '-' || substr(md5(gen_random_uuid()::text), 1, 4)),
  created_by    UUID        NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. GROUP MEMBERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID        NOT NULL REFERENCES public.groups(id)   ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'member'
                          CHECK (role IN ('admin', 'member')),
  -- payout order; NULL until the order is decided (relevant for Undian Acak)
  position    INT         CHECK (position > 0),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id),
  UNIQUE (group_id, position)
);

-- ── 4. ROUNDS (GILIRAN) ──────────────────────────────────────
-- One row per round in a group. Tracks who gets the pot and when.
CREATE TABLE IF NOT EXISTS public.rounds (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  round_number     INT         NOT NULL CHECK (round_number > 0),
  recipient_id     UUID        REFERENCES public.profiles(id),      -- NULL until decided
  scheduled_date   DATE        NOT NULL,
  payout_date      DATE,                                            -- actual date money was transferred
  status           TEXT        NOT NULL DEFAULT 'akan'
                               CHECK (status IN ('akan', 'menunggu', 'selesai')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, round_number)
);

-- ── 5. PAYMENTS (IURAN) ──────────────────────────────────────
-- One row per member per round. Tracks each person's iuran contribution.
CREATE TABLE IF NOT EXISTS public.payments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID        NOT NULL REFERENCES public.groups(id)   ON DELETE CASCADE,
  round_id         UUID        NOT NULL REFERENCES public.rounds(id)   ON DELETE CASCADE,
  payer_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount           BIGINT      NOT NULL CHECK (amount > 0),
  status           TEXT        NOT NULL DEFAULT 'akan'
                               CHECK (status IN ('akan', 'menunggu', 'lunas', 'terlambat')),
  -- proof of transfer uploaded by the member
  proof_url        TEXT,
  notes            TEXT,
  -- admin review fields
  confirmed_by     UUID        REFERENCES public.profiles(id),
  rejection_reason TEXT,
  -- timestamps
  due_date         DATE,
  submitted_at     TIMESTAMPTZ,
  confirmed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (round_id, payer_id)
);

-- ── 6. ACTIVITIES ────────────────────────────────────────────
-- Append-only activity feed shown on the Dashboard and group detail.
CREATE TABLE IF NOT EXISTS public.activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID        REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  type        TEXT        NOT NULL
              CHECK (type IN ('paid', 'confirmed', 'rejected', 'joined', 'left', 'giliran', 'bill', 'payout')),
  -- human-readable description (pre-formatted, stored for fast feeds)
  description TEXT        NOT NULL,
  -- flexible bag for icons, colors, related IDs
  metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 7. NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type             TEXT        NOT NULL
                               CHECK (type IN ('bill', 'confirmed', 'rejected', 'giliran', 'joined', 'payout', 'general')),
  title            TEXT        NOT NULL,
  body             TEXT        NOT NULL,
  is_read          BOOLEAN     NOT NULL DEFAULT false,
  -- optional deep-link context
  related_group_id    UUID     REFERENCES public.groups(id)   ON DELETE SET NULL,
  related_payment_id  UUID     REFERENCES public.payments(id) ON DELETE SET NULL,
  related_round_id    UUID     REFERENCES public.rounds(id)   ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. STORAGE BUCKET ────────────────────────────────────────
-- Run this separately if you prefer the Supabase Dashboard UI.
-- Creates a private bucket for payment proof images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- ── 9. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin of a group?
CREATE OR REPLACE FUNCTION public.is_group_admin(gid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: is the current user a member of a group?
CREATE OR REPLACE FUNCTION public.is_group_member(gid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid()
  );
$$;

-- ── profiles ──────────────────────────────────────────────────
-- Users read their own profile; members can read names/initials in shared groups.
CREATE POLICY "profiles: own read-write"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "profiles: group-mates read"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
        AND gm2.user_id = profiles.id
    )
  );

-- ── groups ────────────────────────────────────────────────────
CREATE POLICY "groups: members read"
  ON public.groups FOR SELECT
  USING (public.is_group_member(id));

CREATE POLICY "groups: authenticated insert"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups: admin update"
  ON public.groups FOR UPDATE
  USING (public.is_group_admin(id));

CREATE POLICY "groups: admin delete"
  ON public.groups FOR DELETE
  USING (public.is_group_admin(id));

-- ── group_members ─────────────────────────────────────────────
CREATE POLICY "group_members: group read"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(group_id));

-- Anyone authenticated can join a group via invite code (INSERT handled by app)
CREATE POLICY "group_members: self join"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_members: admin manage"
  ON public.group_members FOR UPDATE
  USING (public.is_group_admin(group_id));

CREATE POLICY "group_members: self leave"
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id OR public.is_group_admin(group_id));

-- ── rounds ────────────────────────────────────────────────────
CREATE POLICY "rounds: members read"
  ON public.rounds FOR SELECT
  USING (public.is_group_member(group_id));

CREATE POLICY "rounds: admin manage"
  ON public.rounds FOR ALL
  USING (public.is_group_admin(group_id));

-- ── payments ──────────────────────────────────────────────────
-- Members see their own payments; admins see all in their groups.
CREATE POLICY "payments: own read"
  ON public.payments FOR SELECT
  USING (auth.uid() = payer_id OR public.is_group_admin(group_id));

CREATE POLICY "payments: own insert"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = payer_id);

-- Member updates own pending payment (e.g. uploading proof);
-- admin updates any payment to confirm/reject.
CREATE POLICY "payments: own or admin update"
  ON public.payments FOR UPDATE
  USING (auth.uid() = payer_id OR public.is_group_admin(group_id));

CREATE POLICY "payments: admin delete"
  ON public.payments FOR DELETE
  USING (public.is_group_admin(group_id));

-- ── activities ────────────────────────────────────────────────
CREATE POLICY "activities: group members read"
  ON public.activities FOR SELECT
  USING (group_id IS NULL OR public.is_group_member(group_id));

-- Activities are created by the server/triggers, not directly by users.
-- Admins can insert manually if needed.
CREATE POLICY "activities: admin insert"
  ON public.activities FOR INSERT
  WITH CHECK (group_id IS NULL OR public.is_group_admin(group_id));

-- ── notifications ─────────────────────────────────────────────
CREATE POLICY "notifications: own"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ── Storage: payment-proofs ───────────────────────────────────
CREATE POLICY "proof: member upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "proof: own read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow group admins to view proof images (path: {user_id}/{payment_id}.jpg)
CREATE POLICY "proof: admin read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1
      FROM public.payments p
      JOIN public.group_members gm ON gm.group_id = p.group_id
      WHERE p.proof_url LIKE '%' || storage.objects.name
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
  );

-- ── 10. INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_members_user    ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group   ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_rounds_group          ON public.rounds(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer        ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_group        ON public.payments(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_round        ON public.payments(round_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date     ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status       ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_activities_group      ON public.activities(group_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor      ON public.activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_created    ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON public.notifications(user_id) WHERE NOT is_read;
-- Trigram index for fast invite code lookup
CREATE INDEX IF NOT EXISTS idx_groups_invite_code    ON public.groups USING gin(invite_code gin_trgm_ops);

-- ── 11. UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 12. PAYMENT STATUS TRIGGER ───────────────────────────────
-- Automatically advances round status when all members in that round have paid.
CREATE OR REPLACE FUNCTION public.check_round_completion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total   INT;
  v_paid    INT;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.group_members
  WHERE group_id = NEW.group_id;

  SELECT COUNT(*) INTO v_paid
  FROM public.payments
  WHERE round_id = NEW.round_id AND status = 'lunas';

  IF v_paid >= v_total THEN
    UPDATE public.rounds
    SET status = 'selesai'
    WHERE id = NEW.round_id AND status = 'menunggu';
  ELSIF v_paid > 0 THEN
    UPDATE public.rounds
    SET status = 'menunggu'
    WHERE id = NEW.round_id AND status = 'akan';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_round_check
  AFTER INSERT OR UPDATE OF status ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.check_round_completion();
