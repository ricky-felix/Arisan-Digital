-- ============================================================================
-- Migration: Storage buckets for uploads (avatars, receipts, payment-proofs)
-- ----------------------------------------------------------------------------
-- The backend storage module (backend/src/storage/*) issues signed upload/read
-- URLs for these three PRIVATE buckets, but nothing creates them. Apply this in
-- Supabase → SQL Editor (or via the CLI) before using any upload flow.
--
-- Idempotent: safe to run multiple times.
-- ============================================================================

-- 1. Create the three private buckets ---------------------------------------
insert into storage.buckets (id, name, public)
values
  ('avatars',        'avatars',        false),
  ('receipts',       'receipts',       false),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- 2. RLS on storage.objects --------------------------------------------------
-- Ownership convention (enforced by the backend too): object paths are prefixed
-- with the owner's user id, i.e. "<auth.uid()>/<uuid>-filename.ext". These
-- policies let a user read/write/delete only their own objects in these buckets.
-- Signed URLs minted by the backend bypass RLS, so these policies are a
-- defence-in-depth layer for any direct client access.

drop policy if exists "uploads_insert_own" on storage.objects;
create policy "uploads_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars', 'receipts', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "uploads_select_own" on storage.objects;
create policy "uploads_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('avatars', 'receipts', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "uploads_update_own" on storage.objects;
create policy "uploads_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'receipts', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "uploads_delete_own" on storage.objects;
create policy "uploads_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars', 'receipts', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- NOTE: If avatars need to be visible to OTHER group members (not just the
-- owner), either flip the 'avatars' bucket to public=true above and store its
-- public URL, or keep it private and resolve a fresh signed read URL on render.
