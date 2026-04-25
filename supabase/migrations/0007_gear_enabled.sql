-- =====================================================================
-- NILPro — Phase 1C polish: split product trade into Gear vs Services.
-- Adds a `gear_enabled` boolean to deal_menus so athletes can opt in to
-- "Free gear & products" independently from the existing
-- `product_trade_enabled` flag (now relabeled "Free services & meals").
-- Idempotent — existing rows default to false.
-- =====================================================================

alter table public.deal_menus
  add column if not exists gear_enabled boolean default false;
