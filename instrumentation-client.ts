import * as Sentry from "@sentry/nextjs";

// Next.js 15 loads this file in the browser before the app hydrates
// (replaces the legacy sentry.client.config.ts convention).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
