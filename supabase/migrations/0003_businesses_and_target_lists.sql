-- =====================================================================
-- NILPro — Phase 1C.3: businesses + target_lists + places cache
-- Adds the tables that back the automated Google Places lookup during
-- signup and the athlete's ongoing target-list review.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BUSINESSES — cached from Google Places. One row per unique place.
-- ---------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,          -- Google's stable identifier
  name text not null,
  formatted_address text,
  city text,
  state text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  phone text,
  website text,
  primary_category text,                -- our normalized category (e.g. "restaurant")
  google_types text[],                  -- raw Google types for reference
  google_rating double precision,
  google_user_ratings_total int,
  email text,                           -- enriched later; manual for Phase 1
  instagram_handle text,                -- enriched later
  global_blacklisted boolean default false,
  blacklisted_reason text,
  created_at timestamptz default now(),
  last_google_sync_at timestamptz default now()
);

create index if not exists businesses_city_state_idx on public.businesses(city, state);
create index if not exists businesses_primary_category_idx on public.businesses(primary_category);
create index if not exists businesses_global_blacklisted_idx on public.businesses(global_blacklisted);

-- ---------------------------------------------------------------------
-- TARGET_LISTS — which businesses are on each athlete's pitch list
-- ---------------------------------------------------------------------
create table if not exists public.target_lists (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','approved','removed','blacklisted')),
  source_category text,                 -- which category search surfaced this business
  source_city text,
  notes text,
  added_at timestamptz default now(),
  approved_at timestamptz,
  removed_at timestamptz,
  unique(athlete_id, business_id)
);

create index if not exists target_lists_athlete_idx on public.target_lists(athlete_id);
create index if not exists target_lists_status_idx on public.target_lists(status);

-- ---------------------------------------------------------------------
-- PLACES_QUERIES — cache of which (city, state, category, radius)
-- combos we've already hit Google for, so we don't re-pay for the same
-- query across different athletes in the same area.
-- ---------------------------------------------------------------------
create table if not exists public.places_queries (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  state text not null,
  category text not null,
  radius_miles int not null,
  last_fetched_at timestamptz default now(),
  result_count int default 0,
  unique(city, state, category, radius_miles)
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.businesses enable row level security;
alter table public.target_lists enable row level security;
alter table public.places_queries enable row level security;

-- BUSINESSES: any authenticated user can read (Google data is public anyway).
-- Writes are server-only via the service_role key, so no INSERT/UPDATE policies
-- for regular users — RLS denies those by default.
drop policy if exists "businesses authed-read" on public.businesses;
create policy "businesses authed-read" on public.businesses
  for select using (auth.role() = 'authenticated');

-- TARGET_LISTS: athlete reads/writes only their own rows; admins see all.
drop policy if exists "target_lists self-select" on public.target_lists;
create policy "target_lists self-select" on public.target_lists
  for select using (auth.uid() = athlete_id or public.is_admin());

drop policy if exists "target_lists self-insert" on public.target_lists;
create policy "target_lists self-insert" on public.target_lists
  for insert with check (auth.uid() = athlete_id);

drop policy if exists "target_lists self-update" on public.target_lists;
create policy "target_lists self-update" on public.target_lists
  for update using (auth.uid() = athlete_id or public.is_admin())
  with check (auth.uid() = athlete_id or public.is_admin());

drop policy if exists "target_lists self-delete" on public.target_lists;
create policy "target_lists self-delete" on public.target_lists
  for delete using (auth.uid() = athlete_id or public.is_admin());

-- PLACES_QUERIES: server-only (service_role bypasses RLS).
-- No user-facing policies — everyone else is denied by default.
