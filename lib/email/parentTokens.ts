import crypto from "node:crypto";

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
