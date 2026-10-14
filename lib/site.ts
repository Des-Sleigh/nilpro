/**
 * Canonical public origin for links we put in emails, QR codes, and auth
 * redirects. Always comes from configuration — never from the request's
 * `Origin`/`Host` headers, which are client-controlled and would let a
 * forged request point a parent-consent or password-reset link at another
 * host.
 */
const DEFAULT_SITE_URL = "https://thenilpro.com";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

/** Absolute URL for a same-origin path, e.g. `absoluteUrl("/dashboard")`. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
