-- =====================================================================
-- NILPro — Close two privilege-escalation paths left open after 0012
--
-- 1. athletes INSERT. 0012 guards protected columns on UPDATE only, but
--    the "athletes self-insert" policy let any authenticated user insert
--    their own row with arbitrary values, e.g. straight against the REST
--    API with the public anon key:
--
--      insert into athletes (id, ..., is_minor, parent_approved_at,
--                            subscription_tier)
--      values (auth.uid(), ..., false, now(), 'champion');
--
--    That skips parent consent and the HS state gate entirely. The signup
--    server action now validates input and inserts with the service role,
--    so the client-facing insert policy is removed. The trigger below is
--    defense-in-depth in case an insert policy is ever re-added.
--
-- 2. social_accounts.verified. The "self-all" policy let an athlete flip
--    their own `verified` flag to true, minting a "Verified Athlete" card
--    without admin review. Non-admin callers may now only *clear*
--    verification (which the app does when a handle changes), never set it.
--
-- Idempotent.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. athletes: no client-side inserts
-- ---------------------------------------------------------------------
drop policy if exists "athletes self-insert" on public.athletes;

create or replace function public.athletes_block_self_admin_inserts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (auth.uid() is null) and admins may set anything.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- Anyone else gets server-controlled fields reset to safe defaults.
  new.parent_approved_at := null;
  new.subscription_tier := null;
  new.subscription_status := null;
  new.stripe_customer_id := null;
  new.stripe_subscription_id := null;
  new.admin_notes := null;
  -- Re-draw rather than trust a client value: a squatted id would collide
  -- with the sequence later. Costs one sequence gap; ids are not dense.
  new.member_id := public.next_member_id();
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists athletes_block_self_admin_inserts on public.athletes;
create trigger athletes_block_self_admin_inserts
  before insert on public.athletes
  for each row execute function public.athletes_block_self_admin_inserts();

-- ---------------------------------------------------------------------
-- 2. social_accounts: verification is admin-only
-- ---------------------------------------------------------------------
create or replace function public.social_accounts_guard_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verified := false;
    new.verified_at := null;
    return new;
  end if;

  -- UPDATE: allow clearing verification, never granting it.
  if coalesce(new.verified, false) and not coalesce(old.verified, false) then
    raise exception 'cannot self-verify social account' using errcode = '42501';
  end if;
  if new.verified_at is not null
     and new.verified_at is distinct from old.verified_at then
    raise exception 'cannot self-modify verified_at' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists social_accounts_guard_verification on public.social_accounts;
create trigger social_accounts_guard_verification
  before insert or update on public.social_accounts
  for each row execute function public.social_accounts_guard_verification();
