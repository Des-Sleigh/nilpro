-- =====================================================================
-- NILPro — Phase 1C.7: parent-consent email + approval flow
-- Adds the columns we need to track an issued parent-approval token,
-- a fallback 6-digit code parents can type into thenilpro.com/parent,
-- when the email was sent, and the Resend send status.
-- Idempotent. No new RLS — the existing athletes policies cover us.
-- =====================================================================

alter table public.athletes
  add column if not exists parent_approval_token uuid,
  add column if not exists parent_approval_code text,
  add column if not exists parent_approval_token_sent_at timestamptz,
  add column if not exists parent_approval_email_status text;

create index if not exists athletes_parent_token_idx on public.athletes(parent_approval_token)
  where parent_approval_token is not null;
create index if not exists athletes_parent_code_idx on public.athletes(parent_approval_code)
  where parent_approval_code is not null;
