/**
 * Whitelist a `next` redirect target to a same-origin path.
 * Blocks open-redirect via `//evil.com`, `/\evil.com`, full URLs, and
 * control characters browsers strip before parsing (`/\t/evil.com`).
 * Returns null if the input is not a safe `/`-relative path.
 */
export function safeRedirectPath(next: unknown): string | null {
  if (typeof next !== "string" || next.length === 0) return null;
  if (!next.startsWith("/")) return null;
  // Browsers drop tab/newline and treat `\` as `/` when parsing URLs.
  if (/[\u0000-\u001f\\]/.test(next)) return null;
  if (next.startsWith("//")) return null;
  return next;
}

/**
 * True when `sender` (an Origin or Referer header) is exactly the same
 * origin as `expectedOrigin`. A prefix check is not enough:
 * "https://site.com.evil.com" starts with "https://site.com".
 */
export function isSameOrigin(sender: string | null, expectedOrigin: string): boolean {
  if (!sender) return false;
  try {
    return new URL(sender).origin === expectedOrigin;
  } catch {
    return false;
  }
}
