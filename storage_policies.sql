-- ════════════════════════════════════════════════════════════════
-- Nexio — Storage Policies & Cron Jobs
-- Run this in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- 1. Enable pg_cron for auto-deletion
create extension if not exists pg_cron;

-- 2. Stories Expiry Updates (12 Hours)
-- Update default expiry to 12 hours
alter table stories 
alter column expires_at set default (now() + interval '12 hours');

-- Update existing active stories (optional, to align them)
update stories 
set expires_at = created_at + interval '12 hours' 
where expires_at > now();

-- 3. Auto-Delete Cron Job
-- Deletes expired stories every hour
select cron.schedule(
  'delete-expired-stories', -- job name
  '0 * * * *',              -- every hour
  $$delete from stories where expires_at < now()$$
);

-- Note: Storage file cleanup usually requires an edge function or a separate trigger.
-- For now, we rely on the DB deletion. Orphaned files in storage can be cleaned up
-- by a separate maintenance script if needed.

-- 4. Storage Bucket RLS Policies

-- Enable RLS on objects
alter table storage.objects enable row level security;

-- ── Profile Images Bucket ───────────────────────────────────────
insert into storage.buckets (id, name, public) 
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

create policy "Profile Images: Public Read"
on storage.objects for select
using ( bucket_id = 'profile-images' );

create policy "Profile Images: Auth Upload"
on storage.objects for insert
with check ( bucket_id = 'profile-images' and auth.role() = 'authenticated' );

create policy "Profile Images: Owner Update"
on storage.objects for update
using ( bucket_id = 'profile-images' and owner = auth.uid() );

create policy "Profile Images: Owner Delete"
on storage.objects for delete
using ( bucket_id = 'profile-images' and owner = auth.uid() );

-- ── Chat Media Bucket ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

create policy "Chat Media: Public Read"
on storage.objects for select
using ( bucket_id = 'chat-media' );

create policy "Chat Media: Auth Upload"
on storage.objects for insert
with check ( bucket_id = 'chat-media' and auth.role() = 'authenticated' );

create policy "Chat Media: Owner Delete"
on storage.objects for delete
using ( bucket_id = 'chat-media' and owner = auth.uid() );

-- ── Story Media Bucket ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', true)
on conflict (id) do nothing;

create policy "Story Media: Public Read"
on storage.objects for select
using ( bucket_id = 'story-media' );

create policy "Story Media: Auth Upload"
on storage.objects for insert
with check ( bucket_id = 'story-media' and auth.role() = 'authenticated' );

create policy "Story Media: Owner Delete"
on storage.objects for delete
using ( bucket_id = 'story-media' and owner = auth.uid() );
