/**
 * Client-side event tracking. Pageviews are handled automatically by
 * PostHogTracker.tsx. Use this helper only for custom events that
 * aren't pageviews (downloads, uploads, form submissions, etc.).
 *
 * Safe to call even when PostHog isn't loaded (env var missing in dev,
 * ad-blocker active, etc.) — silently no-ops.
 */

import posthog from "posthog-js";

type Props = Record<string, string | number | boolean | null | undefined>;

export function track(eventName: string, props?: Props) {
  if (typeof window === "undefined") return;
  // posthog-js exposes __loaded once init() has run.
  if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return;
  try {
    posthog.capture(eventName, props ?? {});
  } catch {
    // never let analytics break the user flow
  }
}

/** Tag the current user with an athlete id once they're authenticated.
 *  PostHog merges this anonymous→identified user automatically. */
export function identify(athleteId: string, props?: Props) {
  if (typeof window === "undefined") return;
  if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return;
  try {
    posthog.identify(athleteId, props ?? {});
  } catch {
    // never let analytics break the user flow
  }
}
