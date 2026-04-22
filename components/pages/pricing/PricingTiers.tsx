import Link from "next/link";

export function PricingTiers() {
  return (
    <section className="section" style={{ paddingTop: "2rem" }}>
      <div className="container-page">
        <div className="pricing-grid">
          <div className="tier">
            <div className="tier__name">Starter</div>
            <div className="tier__price">
              <span className="tier__amt">$19</span>
              <span className="tier__per">/YR</span>
            </div>
            <div className="tier__desc">
              Everything you need to land real deals.
            </div>
            <ul className="tier__features">
              <li>Outreach to 100–200 local businesses</li>
              <li>Your terms pitched to every business</li>
              <li>Full response dashboard (Yes / No / Counter)</li>
              <li>Contract templates at your terms</li>
              <li>Pause &amp; resume outreach anytime</li>
              <li>Standard referral rewards</li>
            </ul>
            <Link
              href="/signup?tier=starter"
              className="btn btn--ghost tier__cta"
            >
              Start starter
            </Link>
          </div>

          <div className="tier tier--featured">
            <div className="tier__badge">MOST CHOSEN</div>
            <div className="tier__name">Pro</div>
            <div className="tier__price">
              <span className="tier__amt">$39</span>
              <span className="tier__per">/YR</span>
            </div>
            <div className="tier__desc">
              More reach. Better tools. Bigger network.
            </div>
            <ul className="tier__features">
              <li>Everything in Starter</li>
              <li>Up to 400 businesses pitched</li>
              <li>AI follow-up automation</li>
              <li>Priority response monitoring</li>
              <li>Advanced deal analytics</li>
              <li>Enhanced referral rewards</li>
            </ul>
            <Link
              href="/signup?tier=pro"
              className="btn btn--primary tier__cta"
            >
              Go pro
            </Link>
          </div>

          <div className="tier">
            <div className="tier__name">Champion</div>
            <div className="tier__price">
              <span className="tier__amt">$79</span>
              <span className="tier__per">/YR</span>
            </div>
            <div className="tier__desc">
              Full suite for athletes building a real brand.
            </div>
            <ul className="tier__features">
              <li>Everything in Pro</li>
              <li>Unlimited outreach rounds</li>
              <li>Pro bio &amp; press-kit generation</li>
              <li>Quarterly 1-on-1 strategy calls</li>
              <li>First access to new features</li>
              <li>Maximum referral multipliers</li>
            </ul>
            <Link
              href="/signup?tier=champion"
              className="btn btn--dark tier__cta"
            >
              Go champion
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            padding: "2rem",
            marginTop: "2rem",
            borderRadius: "var(--r-md)",
          }}
        >
          <span className="label">TEAM RATE</span>
          <h3 style={{ margin: "1rem 0 0.75rem" }}>
            $12/athlete/yr at 10+ signups
          </h3>
          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "0.95rem",
              maxWidth: "46rem",
            }}
          >
            Coaches and athletic departments can sign up groups of 10 or more at
            a discounted team rate. Team-level dashboard (no financial data) and
            compliance tracking included.{" "}
            <Link
              href="/coaches"
              style={{
                color: "var(--green)",
                textDecoration: "underline",
              }}
            >
              Learn more →
            </Link>
          </p>
        </div>

        <div style={{ marginTop: "4rem" }}>
          <h3
            style={{
              textAlign: "center",
              fontSize: "1.5rem",
              marginBottom: "1rem",
              color: "var(--text)",
            }}
          >
            Always included ·{" "}
            <span className="accent-green">regardless of tier</span>
          </h3>
          <div className="stat-bar">
            <div className="stat-bar__cell">
              <span className="stat-bar__num">0%</span>
              <span className="stat-bar__label">Commission on deals</span>
            </div>
            <div className="stat-bar__cell">
              <span className="stat-bar__num">ANYTIME</span>
              <span className="stat-bar__label">
                Pause, cancel, or refund pre-outreach
              </span>
            </div>
            <div className="stat-bar__cell">
              <span className="stat-bar__num">100%</span>
              <span className="stat-bar__label">Of earnings to you</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
