import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry init. Next.js calls register() once per runtime
 * (Node.js and Edge); the same config serves both. No-ops without a DSN.
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
