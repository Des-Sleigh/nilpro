import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/** UUID v4 token used as the `?token=…` query param in the parent-consent
 *  email link. Single-use — cleared on approval so the link can't be reused. */
export function newParentToken(): string {
  return crypto.randomUUID();
}

/** 6-digit numeric code for parents who can't (or won't) use the email link.
 *  Shown to the athlete on the dashboard so they can read it to a parent
 *  out-of-band. Stable across email re-sends — only rotates if we explicitly
 *  rotate it.
 *
 *  Uses crypto.randomInt() (CSPRNG) instead of Math.random() — the latter is
 *  not cryptographically secure and its output is recoverable from observed
 *  samples in the same V8 process, which would let an attacker narrow guesses
 *  against the 1M-combination code space. */
export function newParentCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/** A parent code not currently held by any pending athlete. Codes are
 *  unique in the database (migration 0014); checking first keeps the
 *  common path to a single insert. Pass a client that can read every
 *  athlete row (service role) — an RLS-scoped client only sees its own. */
export async function newUniqueParentCode(
  sb: SupabaseClient,
  attempts = 5
): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const candidate = newParentCode();
    const { data, error } = await sb
      .from("athletes")
      .select("id")
      .eq("parent_approval_code", candidate)
      .maybeSingle();
    if (error) throw new Error(`parent code lookup failed: ${error.message}`);
    if (!data) return candidate;
  }
  throw new Error("could not allocate a unique parent code");
}
