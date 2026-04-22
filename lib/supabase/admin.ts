import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client — bypasses Row Level Security.
 * Use ONLY in Route Handlers / Server Actions / scripts that need
 * full-database access (webhook receivers, admin panel queries, etc.).
 *
 * NEVER import this from a Client Component or from code that runs
 * anywhere near the browser — the service_role key has full DB access.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
