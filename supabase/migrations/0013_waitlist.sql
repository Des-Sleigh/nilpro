-- =====================================================================
-- NILPro — Beta waitlist
-- Pre-launch email capture from /waitlist. Anonymous-writable (anyone
-- can sign up); admin-only readable.
-- =====================================================================

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  state text,
  level text,                  -- 'HS' | 'College' | 'Parent' | 'Coach' | 'Business' | null
  source text,                 -- referrer / utm_source captured client-side
  ip_hash text,                -- hashed for soft rate-limiting; not raw IP
  user_agent text,
  created_at timestamptz default now() not null
);

-- Case-insensitive unique constraint on email — one signup per address.
create unique index if not exists waitlist_signups_email_lower_idx
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_idx
  on public.waitlist_signups (created_at desc);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.waitlist_signups enable row level security;

-- Anyone (anon or authenticated) can INSERT their own signup.
-- No SELECT / UPDATE / DELETE for non-admins (default-deny).
drop policy if exists "waitlist anyone insert" on public.waitlist_signups;
create policy "waitlist anyone insert"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

-- Admins can read everything.
drop policy if exists "waitlist admins read" on public.waitlist_signups;
create policy "waitlist admins read"
  on public.waitlist_signups
  for select
  to authenticated
  using (public.is_admin());
