import { withSentryConfig } from "@sentry/nextjs";

/**
 * Security headers applied to every response. Sourced from the security
 * audit (Cat 7 high-severity finding: no headers configured anywhere).
 *
 * - CSP: defense-in-depth against XSS and against embedding via untrusted
 *   third parties. `frame-ancestors 'none'` blocks clickjacking.
 *   PostHog and Sentry need allowlist entries for their endpoints.
 * - HSTS: forces HTTPS on every subsequent visit; preload-eligible.
 * - X-Content-Type-Options: stops MIME sniffing (browsers won't promote
 *   text/plain to HTML based on content).
 * - Referrer-Policy: same-origin only on cross-origin requests.
 * - X-Frame-Options: redundant with CSP frame-ancestors but kept for
 *   older browsers that don't honor frame-ancestors.
 * - Permissions-Policy: opt out of risky browser features by default.
 */
const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inlines small scripts; PostHog + Sentry need their hosts.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com https://*.ingest.us.sentry.io https://*.ingest.sentry.io",
      // Tailwind/inline styles + Google Fonts.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Avatars come from Supabase storage (public bucket); cards from
      // /api/cards (same origin); QR codes are inlined as data URLs.
      "img-src 'self' data: blob: https://*.supabase.co https://cdn.jsdelivr.net",
      // Google Fonts woff2 binaries.
      "font-src 'self' data: https://fonts.gstatic.com",
      // Supabase, PostHog, Sentry, Resend webhooks, Google Places.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://*.ingest.us.sentry.io https://*.ingest.sentry.io https://cdn.jsdelivr.net",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to every route except Next.js internals and static assets.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: false,
    })
  : nextConfig;
