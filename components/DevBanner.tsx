import Link from "next/link";

/**
 * Site-wide "in development" notice. Lives above the nav so it's the first
 * thing visitors see. Sets honest expectations: NILPro is shippable today
 * (signup works, dashboard works, state-rules page is live) but Stripe is
 * not wired and outreach automation is still under construction.
 *
 * Server component (no interactivity). To dismiss site-wide, just remove
 * this import from app/layout.tsx — no need to keep a "dismissed" flag.
 */
export function DevBanner() {
  return (
    <div className="dev-banner">
      <div className="container-page dev-banner__inner">
        <span className="dev-banner__pill">IN DEVELOPMENT</span>
        <span className="dev-banner__text">
          NILPro is a working pre-launch product. Browse the site, try the signup
          flow, see the state-rules tool — public launch coming soon.
        </span>
        <Link href="/waitlist" className="dev-banner__cta">
          Join the waitlist →
        </Link>
      </div>
    </div>
  );
}
