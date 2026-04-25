-- =====================================================================
-- NILPro — Phase 1E: pitches log + admin notes
-- Adds the pitches table that records every pitch we send on an
-- athlete's behalf, plus an admin_notes column on athletes for
-- founder-only operational notes during the manual phase.
-- =====================================================================

alter table public.athletes
  add column if not exists admin_notes text;

create table if not exists public.pitches (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  target_list_id uuid references public.target_lists(id) on delete set null,
  status text not null default 'sent'
    check (status in (
      'queued','sent','opened','replied_yes','replied_counter',
      'replied_no','unsubscribed','no_response','bounced'
    )),
  subject text,
  body text,
  sent_via text default 'manual',  -- 'manual','instantly','smartlead' future
  pitch_round int default 1,
  sent_at timestamptz default now(),
  responded_at timestamptz,
  response_text text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists pitches_athlete_idx on public.pitches(athlete_id);
create index if not exists pitches_business_idx on public.pitches(business_id);
create index if not exists pitches_status_idx on public.pitches(status);
create index if not exists pitches_sent_at_idx on public.pitches(sent_at desc);

alter table public.pitches enable row level security;

drop policy if exists "pitches self-select" on public.pitches;
create policy "pitches self-select" on public.pitches
  for select using (auth.uid() = athlete_id or public.is_admin());

-- Writes are admin-only via service role (no insert/update/delete policies
-- for regular users — RLS denies by default).

-- ---------------------------------------------------------------------
-- ONE-TIME ADMIN BOOTSTRAP — run this manually after migrating, with
-- your auth user id substituted in. The admin_users table from 0001
-- has columns (id uuid pk references auth.users, role text, created_at).
-- There is NO email column, so we look up the user_id by email from
-- auth.users and insert a row keyed on that id.
--
-- insert into public.admin_users (id, role)
--   select id, 'admin' from auth.users where email = 'YOU@example.com'
--   on conflict (id) do nothing;
-- ---------------------------------------------------------------------
