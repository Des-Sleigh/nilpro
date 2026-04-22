export function ReferralLadder() {
  return (
    <section className="section" style={{ paddingTop: "2rem" }}>
      <div className="container-page">
        <div className="section-head">
          <span className="label">THE LADDER</span>
          <h2 style={{ marginTop: "1.25rem" }}>
            Every referral <span className="accent-green">stacks.</span>
          </h2>
          <p className="section-head__lede">
            Refer as few or as many as you want. Rewards hit automatically the
            moment your friend pays.
          </p>
        </div>

        <div className="rungs">
          <div className="rung">
            <div className="rung__count">
              1<small>REF</small>
            </div>
            <div className="rung__label">First unlock</div>
            <div className="rung__reward">+1 Month free</div>
            <div className="rung__desc">
              Added to your subscription the moment your friend pays. Stacks
              with every referral after.
            </div>
          </div>

          <div className="rung">
            <div className="rung__count">
              3<small>REFS</small>
            </div>
            <div className="rung__label">Tier up</div>
            <div className="rung__reward">Free Pro upgrade</div>
            <div className="rung__desc">
              Instant upgrade to Pro for the remainder of your current term. 2×
              outreach reach, follow-up automation, advanced analytics.
            </div>
          </div>

          <div className="rung">
            <div className="rung__count">
              5<small>REFS</small>
            </div>
            <div className="rung__label">Full year</div>
            <div className="rung__reward">Free next year at Pro</div>
            <div className="rung__desc">
              Your next full year renewed free at the Pro tier. No payment, no
              lapse. Normal value: $39.
            </div>
          </div>

          <div className="rung rung--max">
            <div className="rung__badge">MAX</div>
            <div className="rung__count">
              10<small>REFS</small>
            </div>
            <div className="rung__label">Champion</div>
            <div className="rung__reward">Free year at Champion</div>
            <div className="rung__desc">
              Full year of Champion tier on us — unlimited outreach, 1-on-1
              strategy calls, first access to new features. Normal value: $79.
            </div>
          </div>
        </div>

        <div className="notebox" style={{ marginTop: "2rem" }}>
          <span className="notebox__head">HOW STACKING WORKS</span>
          Each milestone triggers its own reward. Hit 3 referrals? You get the
          +3 months (1+1+1) AND the free Pro upgrade. Hit 10? You collect
          everything along the way. Rewards don&apos;t replace each other — they
          stack.
        </div>
      </div>
    </section>
  );
}
