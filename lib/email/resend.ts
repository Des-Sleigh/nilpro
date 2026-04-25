import { Resend } from "resend";

let _client: Resend | null = null;

/** Lazily-initialized Resend client. Returns null if no API key (so the
 *  app deploys gracefully without email infra in dev/preview).
 */
export function getResend(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[resend] RESEND_API_KEY not set — emails will be skipped");
    return null;
  }
  _client = new Resend(key);
  return _client;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "NILPro <hello@thenilpro.com>";
}
