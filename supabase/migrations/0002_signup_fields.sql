-- =====================================================================
-- NILPro — Phase 1C.1: signup flow field additions
-- Adds DOB (for under-18 detection), business-category preferences,
-- and a referral-code pair (the athlete's own shareable code + the
-- code they signed up with, if any).
-- =====================================================================

alter table public.athletes
  add column if not exists date_of_birth date,
  add column if not exists business_categories text[],
  add column if not exists referral_code text unique,
  add column if not exists referred_by_code text;

create index if not exists athletes_referral_code_idx on public.athletes(referral_code);

-- Convenience: computed view-friendly check for minor status.
-- (We don't store `is_minor` as a generated column here because Postgres
-- won't let generated columns reference volatile functions like now();
-- callers compute from date_of_birth at query time or at signup.)
