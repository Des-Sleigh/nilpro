const STOPS: {
  week: string;
  label: string;
  title: string;
  desc: string;
  tag: string;
}[] = [
  {
    week: "WK 1",
    label: "Kickoff",
    title: "Pitches fire",
    desc:
      "Your approved target list goes live. Personalized pitches start going out, paced to stay effective and never spammy.",
    tag: "Hundreds of businesses contacted",
  },
  {
    week: "WK 2",
    label: "Signals",
    title: "First replies land",
    desc:
      "Interested businesses hit back. Responses sorted in your dashboard. We draft follow-ups for anyone asking questions.",
    tag: "7–14 day response window",
  },
  {
    week: "MO 1–2",
    label: "Scoreboard",
    title: "First deals close",
    desc:
      "Usually product/service first — weekly meals, gym membership, monthly haircut. Cash deals start shaping up in parallel.",
    tag: "1–3 deals typical",
  },
  {
    week: "MO 3+",
    label: "Momentum",
    title: "Portfolio built",
    desc:
      "Repeat rounds surface bigger deals. Businesses that know you refer more. Your relationships compound year over year.",
    tag: "Deals compound",
  },
];

export function PlayByPlay() {
  return (
    <section className="playbyplay section">
      <div className="container-page">
        <div className="section-head">
          <span className="label">04 / PLAY-BY-PLAY</span>
          <h2>
            Your first 90 days, <span className="accent-green">called in advance.</span>
          </h2>
          <p className="section-head__lede">
            Realistic timeline from kickoff to closed deals. First replies in days. First deals
            in weeks. Real portfolio in months.
          </p>
        </div>

        <div className="timeline-wrap">
          <div className="timeline-grid">
            {STOPS.map((s) => (
              <div className="tl-card" key={s.week}>
                <div className="tl-dot"></div>
                <div className="tl-week">{s.week}</div>
                <div className="tl-label">{s.label}</div>
                <div className="tl-title">{s.title}</div>
                <p className="tl-desc">{s.desc}</p>
                <div className="tl-tag">
                  <span className="dot"></span> {s.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
