-- =====================================================================
-- NILPro — Phase 1C initial schema
-- Tables: athletes, deal_menus, pitch_cities, social_accounts, admin_users
-- Row Level Security: athletes see only their own rows, admins see all.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ATHLETES — one row per signed-up athlete. id = auth.users.id
-- ---------------------------------------------------------------------
create table if not exists public.athletes (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  sport text not null,
  position text,
  level text not null check (level in ('D1','D2','D3','NAIA','JUCO','HS','Club')),
  school text not null,
  graduation_year int,
  hometown_city text,
  hometown_state text,
  bio text,
  profile_photo_url text,
  subscription_tier text check (subscription_tier in ('starter','pro','champion')),
  subscription_status text check (subscription_status in ('trial','active','canceled','past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  is_minor boolean default false,
  parent_email text,
  parent_first_name text,
  parent_approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists athletes_level_idx on public.athletes(level);
create index if not exists athletes_school_idx on public.athletes(school);

-- ---------------------------------------------------------------------
-- 2. DEAL_MENUS — what deal types each athlete accepts
-- ---------------------------------------------------------------------
create table if not exists public.deal_menus (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null unique references public.athletes(id) on delete cascade,
  cash_per_post_enabled boolean default false,
  cash_per_post_min int,
  product_trade_enabled boolean default false,
  appearance_enabled boolean default false,
  appearance_min int,
  mutual_promo_enabled boolean default false,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 3. PITCH_CITIES — which cities each athlete wants outreach in
-- ---------------------------------------------------------------------
create table if not exists public.pitch_cities (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  city text not null,
  state text not null,
  radius_miles int default 10,
  is_hometown boolean default false,
  is_school_city boolean default false,
  created_at timestamptz default now()
);

create index if not exists pitch_cities_athlete_idx on public.pitch_cities(athlete_id);

-- ---------------------------------------------------------------------
-- 4. SOCIAL_ACCOUNTS — IG / TikTok handles + verification state
-- ---------------------------------------------------------------------
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  platform text not null check (platform in ('instagram','tiktok')),
  handle text not null,
  followers_count int,
  verified boolean default false,
  verified_at timestamptz,
  verification_code text,
  verification_code_sent_at timestamptz,
  created_at timestamptz default now(),
  unique(athlete_id, platform)
);

create index if not exists social_accounts_athlete_idx on public.social_accounts(athlete_id);

-- ---------------------------------------------------------------------
-- 5. ADMIN_USERS — founder + future team. id = auth.users.id
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'admin' check (role in ('admin','staff')),
  created_at timestamptz default now()
);

-- Helper: check if the current auth user is an admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(select 1 from public.admin_users where id = auth.uid());
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Every table: athletes read/write only their own rows; admins see all.
-- =====================================================================

alter table public.athletes enable row level security;
alter table public.deal_menus enable row level security;
alter table public.pitch_cities enable row level security;
alter table public.social_accounts enable row level security;
alter table public.admin_users enable row level security;

-- ATHLETES policies
drop policy if exists "athletes self-select" on public.athletes;
create policy "athletes self-select" on public.athletes
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "athletes self-insert" on public.athletes;
create policy "athletes self-insert" on public.athletes
  for insert with check (auth.uid() = id);

drop policy if exists "athletes self-update" on public.athletes;
create policy "athletes self-update" on public.athletes
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- DEAL_MENUS policies
drop policy if exists "deal_menus self-all" on public.deal_menus;
create policy "deal_menus self-all" on public.deal_menus
  for all using (auth.uid() = athlete_id or public.is_admin())
  with check (auth.uid() = athlete_id or public.is_admin());

-- PITCH_CITIES policies
drop policy if exists "pitch_cities self-all" on public.pitch_cities;
create policy "pitch_cities self-all" on public.pitch_cities
  for all using (auth.uid() = athlete_id or public.is_admin())
  with check (auth.uid() = athlete_id or public.is_admin());

-- SOCIAL_ACCOUNTS policies
drop policy if exists "social_accounts self-all" on public.social_accounts;
create policy "social_accounts self-all" on public.social_accounts
  for all using (auth.uid() = athlete_id or public.is_admin())
  with check (auth.uid() = athlete_id or public.is_admin());

-- ADMIN_USERS — only admins can read/write this table
drop policy if exists "admin_users admin-only" on public.admin_users;
create policy "admin_users admin-only" on public.admin_users
  for all using (public.is_admin())
  with check (public.is_admin());
