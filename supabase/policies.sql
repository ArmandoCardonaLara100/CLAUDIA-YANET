-- ────────────────────────────────────────────────────────────────────────
-- PsiConnect — Supabase setup (run AFTER `npm run db:migrate`)
--
-- Drizzle migrations create the tables as the `postgres` owner, which BYPASSES
-- RLS — so the app's server-side queries (via DATABASE_URL) are unaffected by
-- the policies below. These policies exist ONLY to scope Realtime streams,
-- which connect as the `authenticated` role using the per-user JWT minted in
-- app/actions/realtime.ts.
-- ────────────────────────────────────────────────────────────────────────

-- 1. Private storage buckets ------------------------------------------------
insert into storage.buckets (id, name, public)
values ('content', 'content', false),
       ('patient-uploads', 'patient-uploads', false)
on conflict (id) do nothing;
-- No storage RLS policies needed: uploads use signed upload URLs and downloads
-- use signed URLs, both generated server-side with the service-role key.

-- 2. Enable Row Level Security ----------------------------------------------
alter table public.users             enable row level security;
alter table public.clinical_records  enable row level security;
alter table public.content           enable row level security;
alter table public.patient_uploads   enable row level security;

-- 3. SELECT policies (admin sees all; patients see only their own rows) ------
-- Realtime delivers Postgres changes through these SELECT policies.

drop policy if exists rt_users_select on public.users;
create policy rt_users_select on public.users
  for select to authenticated
  using (
    (auth.jwt() ->> 'user_role') = 'admin'
    or id::text = (auth.jwt() ->> 'sub')
  );

drop policy if exists rt_clinical_select on public.clinical_records;
create policy rt_clinical_select on public.clinical_records
  for select to authenticated
  using (
    (auth.jwt() ->> 'user_role') = 'admin'
    or patient_id::text = (auth.jwt() ->> 'sub')
  );

drop policy if exists rt_content_select on public.content;
create policy rt_content_select on public.content
  for select to authenticated
  using (
    (auth.jwt() ->> 'user_role') = 'admin'
    or patient_id::text = (auth.jwt() ->> 'sub')
  );

drop policy if exists rt_uploads_select on public.patient_uploads;
create policy rt_uploads_select on public.patient_uploads
  for select to authenticated
  using (
    (auth.jwt() ->> 'user_role') = 'admin'
    or patient_id::text = (auth.jwt() ->> 'sub')
  );

-- 4. Full replica identity so DELETE payloads include all columns -----------
alter table public.users            replica identity full;
alter table public.clinical_records replica identity full;
alter table public.content          replica identity full;
alter table public.patient_uploads  replica identity full;

-- 5. Add tables to the realtime publication ---------------------------------
do $$
begin
  alter publication supabase_realtime add table public.users;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table public.clinical_records;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table public.content;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table public.patient_uploads;
exception when duplicate_object then null; end $$;
