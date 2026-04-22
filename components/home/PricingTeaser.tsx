import Link from "next/link";

export function PricingTeaser() {
  return (
    <section
      className="section"
      style={{
        background: "var(--bg-soft)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-page">
        <div
          className="section-head"
          style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}
        >
          <span className="label" style={{ justifyContent: "center" }}>
            05 / THE LINEUP CARD
          </span>
          <h2 style={{ marginTop: "1.25rem" }}>
            Pick your <span className="accent-green">play.</span>
          </h2>
          <p
            className="section-head__lede"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            One flat price. No commission. Cancel anytime. Upgrade if you want more firepower.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="tier">
            <div className="tier__name">Starter</div>
            <div className="tier__price">
              <span className="tier__amt">$19</span>
              <span className="tier__per">/YR</span>
            </div>
            <div className="tier__desc">Everything you need to land real deals.</div>
            <ul className="tier__features">
              <li>Outreach to 100–200 local businesses</li>
              <li>AI pitches you preview &amp; approve</li>
              <li>Full response dashboard</li>
              <li>Contract templates</li>
              <li>Weekly activity digest</li>
              <li>Standard referral rewards</li>
            </ul>
            <Link href="/signup" className="btn btn--ghost tier__cta">
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
            <div className="tier__desc">More reach. Better tools. Bigger network.</div>
            <ul className="tier__features">
              <li>Everything in Starter</li>
              <li>Up to 400 businesses pitched</li>
              <li>AI follow-up automation</li>
              <li>Priority response monitoring</li>
              <li>Advanced deal analytics</li>
              <li>Enhanced referral rewards</li>
            </ul>
            <Link href="/signup" className="btn btn--primary tier__cta">
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
            <Link href="/signup" className="btn btn--dark tier__cta">
              Go champion
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/pricing" className="btn btn--ghost">
            See full pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
