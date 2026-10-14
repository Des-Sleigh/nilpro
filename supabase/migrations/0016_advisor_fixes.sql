-- =====================================================================
-- NILPro — Supabase security-advisor cleanup
--
-- 1. next_member_id() had a role-mutable search_path (lint 0011). Pin it.
--
-- 2. Trigger functions were exposed as RPC endpoints to anon/authenticated
--    (lint 0028/0029). Triggers don't need EXECUTE at fire time, so revoke
--    it; they can no longer be hit via /rest/v1/rpc/*.
--
-- Intentionally left as-is (documented so the advisor output is expected):
--   * is_admin() stays executable: RLS policies call it as the querying
--     role, and it only reveals whether the caller is an admin.
--   * get_public_athlete_profile() is the public-card read path by design;
--     it returns public columns only (see 0010).
--   * places_queries has RLS with no policies: service-role-only cache.
--
-- Idempotent.
-- =====================================================================

alter function public.next_member_id() set search_path = public;

revoke execute on function public.athletes_block_self_admin_writes()
  from public, anon, authenticated;
revoke execute on function public.athletes_block_self_admin_inserts()
  from public, anon, authenticated;
revoke execute on function public.social_accounts_guard_verification()
  from public, anon, authenticated;
