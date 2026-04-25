import crypto from "node:crypto";

/** UUID v4 token used as the `?token=…` query param in the parent-consent
 *  email link. Single-use — cleared on approval so the link can't be reused. */
export function newParentToken(): string {
  return crypto.randomUUID();
}

/** 6-digit numeric code for parents who can't (or won't) use the email link.
 *  Shown to the athlete on the dashboard so they can read it to a parent
 *  out-of-band. Stable across email re-sends — only rotates if we explicitly
 *  rotate it. */
export function newParentCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
