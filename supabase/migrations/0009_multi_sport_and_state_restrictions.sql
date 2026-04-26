-- =====================================================================
-- NILPro — multi-sport athlete support + HS NIL state-restriction flag
-- =====================================================================

-- Multi-sport: keep singular `sport`/`position` for backwards compat,
-- add array variants used by signup going forward. Existing rows get
-- backfilled into the array form.
alter table public.athletes
  add column if not exists sports text[],
  add column if not exists positions text[];

update public.athletes
  set sports = array[sport]
  where sports is null and sport is not null;

update public.athletes
  set positions = array[position]
  where positions is null and position is not null;

-- HS state restriction flag — set when a high-school athlete signs up
-- in a "partial" NIL state so we can surface a notice on the dashboard
-- and require admin review before pitches go out.
alter table public.athletes
  add column if not exists hs_state_restricted boolean default false;
