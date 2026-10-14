import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Best-effort client IP. On Vercel the platform overwrites
 * `x-forwarded-for`, so the first entry is the real client address.
 */
export async function clientIp(): Promise<string> {
  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || hdrs.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window rate limit backed by Postgres (`consume_rate_limit`, see
 * migration 0014), so the count is shared across every serverless
 * instance instead of resetting on each cold start.
 *
 * Returns true when the request is allowed. Fails closed: if the limiter
 * itself errors, the request is rejected, because every caller guards a
 * brute-forceable secret.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error(`[rateLimit] ${key}: ${error.message}`);
    return false;
  }
  return data === true;
}
