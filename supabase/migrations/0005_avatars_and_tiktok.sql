-- =====================================================================
-- NILPro — Phase 1C.4: avatars storage bucket + TikTok handle support
-- Adds a public-read `avatars` storage bucket with per-user write scoping,
-- so athletes can upload their profile photo. TikTok reuses the existing
-- social_accounts(platform='tiktok') row — no new columns needed.
-- =====================================================================

-- Avatar storage bucket. Public-read, authenticated-user-write to
-- their own folder (objects under <user_id>/<filename>).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can read (avatar URLs go on public profile surfaces).
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Authed users can upload/update only their own prefix.
drop policy if exists "avatars self upload" on storage.objects;
create policy "avatars self upload" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars self update" on storage.objects;
create policy "avatars self update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars self delete" on storage.objects;
create policy "avatars self delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
