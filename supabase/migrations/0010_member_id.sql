-- =====================================================================
-- NILPro — Verified Athlete Card support
-- Adds athletes.member_id (zero-padded 5-digit string, e.g. "01842")
-- used as the public identifier for athlete profile pages /a/{member_id}
-- and on the Verified Athlete Card. Sequential, immutable once assigned.
-- =====================================================================

-- 1. Sequence that produces the underlying integer (1 → 99999, then 6 digits).
create sequence if not exists public.athlete_member_id_seq start 1 increment 1;

-- 2. Helper to format the next sequence value as a zero-padded 5-digit string.
--    Falls back to wider padding if we ever exceed 99,999 athletes (we'll be
--    very happy if that happens).
create or replace function public.next_member_id() returns text
language plpgsql as $$
declare
  n bigint;
  s text;
begin
  n := nextval('public.athlete_member_id_seq');
  if n < 100000 then
    s := lpad(n::text, 5, '0');
  else
    s := n::text;
  end if;
  return s;
end;
$$;

-- 3. Add the column. Default to next_member_id() so future inserts auto-assign.
--    Unique constraint enforces no collisions; nullable for backfill window.
alter table public.athletes
  add column if not exists member_id text unique;

alter table public.athletes
  alter column member_id set default public.next_member_id();

-- 4. Backfill existing rows in created_at order so the lowest IDs go to the
--    earliest signups. Idempotent (won't overwrite rows that already have one).
do $$
declare
  r record;
begin
  for r in
    select id from public.athletes
    where member_id is null
    order by created_at, id
  loop
    update public.athletes
    set member_id = public.next_member_id()
    where id = r.id;
  end loop;
end$$;

-- 5. Now make it NOT NULL — every athlete row must have a member_id.
alter table public.athletes
  alter column member_id set not null;

-- 6. Index for /a/{member_id} lookups (the public profile page).
create index if not exists athletes_member_id_idx on public.athletes(member_id);

-- 7. RLS: member_id is part of the public profile read path. The athlete
--    self-select policy already exists; we don't need a new one.
--    For the public /a/{member_id} page (anon + non-owner reads), we need
--    a *limited-fields* read policy. We expose only the columns the public
--    profile page renders, gated by the member_id being non-null.
--    Using a security-definer function so the policy stays narrow.
create or replace function public.get_public_athlete_profile(p_member_id text)
returns table (
  member_id text,
  first_name text,
  last_name text,
  sport text,
  position text,
  level text,
  school text,
  graduation_year int,
  hometown_state text,
  profile_photo_url text,
  member_year int
)
language sql
security definer
stable
set search_path = public
as $$
  select
    a.member_id,
    a.first_name,
    a.last_name,
    a.sport,
    a.position,
    a.level,
    a.school,
    a.graduation_year,
    a.hometown_state,            -- state only; never expose hometown_city publicly
    a.profile_photo_url,
    extract(year from a.created_at)::int as member_year
  from public.athletes a
  where a.member_id = p_member_id
    -- Future: gate on subscription_status='active' once Stripe is wired
$$;

grant execute on function public.get_public_athlete_profile(text) to anon, authenticated;
