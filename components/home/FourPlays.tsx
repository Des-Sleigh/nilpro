export function FourPlays() {
  return (
    <section className="how section">
      <div className="container-page">
        <div className="section-head">
          <span className="label">01 / THE LINEUP</span>
          <h2>
            Four plays. <span className="accent-green">You run all of them.</span>
          </h2>
          <p className="section-head__lede">
            We don&apos;t blast emails on day one. Every move is gated by your approval. If
            anything doesn&apos;t feel right, nothing sends.
          </p>
        </div>

        <div className="how__grid">
          <div className="play-card">
            <span className="play-card__tag">DAY 1</span>
            <span className="play-card__num">01</span>
            <h3>Build the roster</h3>
            <p>Profile + check the boxes for deal types you&apos;ll accept. 5 minutes. You&apos;re in.</p>
          </div>
          <div className="play-card">
            <span className="play-card__tag">DAY 1–2</span>
            <span className="play-card__num">02</span>
            <h3>Scout the targets</h3>
            <p>
              We pull 100–200 local businesses in your hometown &amp; school area, matched to
              your preferences.
            </p>
          </div>
          <div className="play-card play-card--accent">
            <span className="play-card__tag">DAY 2–3</span>
            <span className="play-card__num">03</span>
            <h3>Call the shots</h3>
            <p>
              See every business on the list. Remove anyone you don&apos;t want contacted.
              Nothing sends until you approve.
            </p>
          </div>
          <div className="play-card">
            <span className="play-card__tag">WEEK 1+</span>
            <span className="play-card__num">04</span>
            <h3>Game on</h3>
            <p>
              We pitch <em>your deal menu</em> to local businesses. Yes-responses come back as
              contracts. Counter-offers come back to you to decide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
