import Link from "next/link";

export function ReferralsFinalCta() {
  return (
    <section className="final-cta">
      <div className="container-page">
        <div className="final-cta__inner">
          <h2>
            Already signed up? <em>Start sharing.</em>
          </h2>
          <p>
            Your referral link is waiting in your dashboard. Not signed up yet?
            Starter is $99/year ($19/month) — and every teammate you refer adds 50 more
            pitches to your year.
          </p>
          <div
            className="hero__ctas"
            style={{ justifyContent: "center" }}
          >
            <Link href="/signup" className="btn btn--primary btn--lg">
              Start your profile →
            </Link>
            <Link href="/signup" className="btn btn--ghost btn--lg">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
