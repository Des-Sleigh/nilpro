import Link from "next/link";

export function PricingFinalCta() {
  return (
    <section className="final-cta">
      <div className="container-page">
        <div className="final-cta__inner">
          <h2>
            Get in the game in <em>5 minutes.</em>
          </h2>
          <p>
            Sign up. Review your list. Approve. That&apos;s it. Full refund
            available any time before outreach begins.
          </p>
          <Link href="/signup" className="btn btn--primary btn--lg">
            Start your profile →
          </Link>
        </div>
      </div>
    </section>
  );
}
