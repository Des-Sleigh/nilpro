-- =====================================================================
-- NILPro — Parent-consent code hardening + durable rate limiting
--
-- 1. parent_approval_code had only a plain index. Two athletes could be
--    issued the same 6-digit code, at which point the code lookup's
--    `.maybeSingle()` errors and BOTH parents are told "bad code".
--    A partial unique index makes collisions impossible; the app retries
--    generation on conflict.
--
-- 2. The code-entry form was throttled with an in-memory token bucket.
--    On serverless every cold start / concurrent instance has its own
--    bucket, so the limit was not actually enforced against a determined
--    guesser. `consume_rate_limit` is a fixed-window counter stored in
--    Postgres, shared across every instance. Callable by service_role only.
--
-- 3. The waitlist allowed INSERT from the anon role directly. All signups
--    go through the server action (which validates + normalizes and writes
--    with the service role), so the public policy only served as a way to
--    bypass that validation with the anon key. Removed.
--
-- Idempotent.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Unique parent-approval codes
-- ---------------------------------------------------------------------
-- Clear duplicates on still-pending rows before adding the constraint,
-- keeping the code on the oldest row. Affected athletes can be re-issued
-- a code via the admin "resend consent" action.
with ranked as (
  select id,
         row_number() over (
           partition by parent_approval_code order by created_at, id
         ) as rn
  from public.athletes
  where parent_approval_code is not null
)
update public.athletes a
   set parent_approval_code = null
  from ranked r
 where a.id = r.id
   and r.rn > 1;

drop index if exists public.athletes_parent_code_idx;
create unique index if not exists athletes_parent_code_uniq
  on public.athletes (parent_approval_code)
  where parent_approval_code is not null;

-- ---------------------------------------------------------------------
-- 2. Durable rate limiting
-- ---------------------------------------------------------------------
create table if not exists public.rate_limit_buckets (
  key          text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limit_buckets enable row level security;
-- No policies: default-deny for anon/authenticated. Only the
-- security-definer function below (and service_role) touches it.

create index if not exists rate_limit_buckets_window_idx
  on public.rate_limit_buckets (window_start);

create or replace function public.consume_rate_limit(
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limit_buckets as b (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
    do update set hits = b.hits + 1
  returning b.hits into v_hits;

  -- Opportunistic cleanup so the table stays small without a cron job.
  if random() < 0.01 then
    delete from public.rate_limit_buckets
     where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------
-- 3. Waitlist: server-side writes only
-- ---------------------------------------------------------------------
drop policy if exists "waitlist anyone insert" on public.waitlist_signups;
