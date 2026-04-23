-- =====================================================================
-- NILPro — Phase 1C.3b: athlete skip-list (business name blacklist)
-- Stores lowercase name substrings the athlete never wants pitched.
-- The review screen saves this on submit; the outreach pipeline filters
-- businesses whose `name` contains any of these terms (case-insensitive).
--
-- RLS: the existing athlete self-update policy on public.athletes
-- already covers writes to this column — no new policies needed.
-- =====================================================================

alter table public.athletes
  add column if not exists blacklist_terms text[] default '{}';
