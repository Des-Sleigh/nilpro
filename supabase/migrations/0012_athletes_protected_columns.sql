-- =====================================================================
-- NILPro — Lock down protected columns on `athletes` (security audit Cat 1)
--
-- Bug: the `athletes` self-update RLS policy
--      `for update using (auth.uid() = id) with check (auth.uid() = id)`
--      is COLUMN-BLIND. Once we added columns like `parent_approved_at`,
--      `subscription_tier`, `is_minor`, etc., the policy let an athlete
--      update *any* of them. Concretely a logged-in minor could:
--        update athletes set parent_approved_at = now(),
--                            parent_approval_token = null
--          where id = auth.uid();
--      and bypass parent consent. They could also self-promote tiers,
--      clear `hs_state_restricted`, blank `admin_notes`, etc.
--
-- Fix: a BEFORE UPDATE trigger that, for non-admin / non-service-role
-- callers, raises an exception if any protected column is being changed.
-- This is the column-level enforcement Postgres RLS doesn't provide
-- natively. Service role bypasses (auth.uid() is null). Admin users
-- (rows in admin_users) bypass too — they're the only humans who should
-- write these fields.
-- =====================================================================

create or replace function public.athletes_block_self_admin_writes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
begin
  -- Service role (auth.uid() is NULL when called via service-role key)
  -- bypasses every check below.
  if v_uid is null then
    return new;
  end if;

  -- Admins listed in public.admin_users bypass.
  select exists(select 1 from public.admin_users where id = v_uid)
    into v_is_admin;
  if v_is_admin then
    return new;
  end if;

  -- For non-admin / non-service-role callers, every protected column
  -- must remain unchanged. `is distinct from` correctly handles NULLs.
  if new.parent_approved_at is distinct from old.parent_approved_at then
    raise exception 'cannot self-modify parent_approved_at' using errcode = '42501';
  end if;
  if new.is_minor is distinct from old.is_minor then
    raise exception 'cannot self-modify is_minor' using errcode = '42501';
  end if;
  if new.parent_approval_token is distinct from old.parent_approval_token then
    raise exception 'cannot self-modify parent_approval_token' using errcode = '42501';
  end if;
  if new.parent_approval_code is distinct from old.parent_approval_code then
    raise exception 'cannot self-modify parent_approval_code' using errcode = '42501';
  end if;
  if new.parent_approval_token_sent_at is distinct from old.parent_approval_token_sent_at then
    raise exception 'cannot self-modify parent_approval_token_sent_at' using errcode = '42501';
  end if;
  if new.parent_approval_email_status is distinct from old.parent_approval_email_status then
    raise exception 'cannot self-modify parent_approval_email_status' using errcode = '42501';
  end if;
  if new.subscription_tier is distinct from old.subscription_tier then
    raise exception 'cannot self-modify subscription_tier' using errcode = '42501';
  end if;
  if new.subscription_status is distinct from old.subscription_status then
    raise exception 'cannot self-modify subscription_status' using errcode = '42501';
  end if;
  if new.stripe_customer_id is distinct from old.stripe_customer_id then
    raise exception 'cannot self-modify stripe_customer_id' using errcode = '42501';
  end if;
  if new.stripe_subscription_id is distinct from old.stripe_subscription_id then
    raise exception 'cannot self-modify stripe_subscription_id' using errcode = '42501';
  end if;
  if new.hs_state_restricted is distinct from old.hs_state_restricted then
    raise exception 'cannot self-modify hs_state_restricted' using errcode = '42501';
  end if;
  if new.admin_notes is distinct from old.admin_notes then
    raise exception 'cannot self-modify admin_notes' using errcode = '42501';
  end if;
  if new.member_id is distinct from old.member_id then
    raise exception 'cannot self-modify member_id' using errcode = '42501';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'cannot self-modify created_at' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists athletes_block_self_admin_writes on public.athletes;
create trigger athletes_block_self_admin_writes
  before update on public.athletes
  for each row execute function public.athletes_block_self_admin_writes();
