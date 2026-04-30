-- =====================================================================
-- NILPro — Avatars bucket lockdown (security audit Cat 6 / High)
--
-- The avatars bucket was created in 0005 with `public = true` and no
-- MIME or size constraint. The audit confirmed that any signed-in
-- athlete can use the supabase-js client directly to upload arbitrary
-- content (HTML/JS/SVG with embedded scripts) and have it served from
-- their public Supabase URL. That's stored XSS hosted on a Supabase
-- subdomain — not on thenilpro.com, so cookies are safe, but it
-- credibility-launders phishing pages onto a Supabase URL.
--
-- This migration applies a server-side allow-list at the storage layer:
--   - allowed_mime_types: only image/jpeg, image/png, image/webp
--   - file_size_limit:    10 MB (matches the client-side cap in PhotoForm)
--
-- Together these enforce the constraints regardless of whether the upload
-- comes from the React component or a hand-rolled client.
-- =====================================================================

update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
  file_size_limit = 10485760  -- 10 MB
where id = 'avatars';
