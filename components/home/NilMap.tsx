import { StateRulesExplorer } from "@/components/pages/state-rules/StateRulesExplorer";

export function NilMap() {
  return (
    <section className="nilmap-section">
      <div className="container-page">
        <div className="section-head" style={{ marginBottom: "2rem" }}>
          <span className="label">03.5 / ELIGIBILITY</span>
          <h2>
            NIL is legal <span className="accent-green">where you play.</span>
          </h2>
          <p className="section-head__lede">
            College NIL is legal in all 50 states. High-school NIL is legal in
            45 states plus DC — a handful still have restrictions. Pick your
            state on the map to see what&apos;s permitted, whether your parent
            has to co-sign deal contracts, and what categories are off-limits.
          </p>
        </div>

        <StateRulesExplorer />

        <div className="nilmap__stats" style={{ marginTop: "2rem" }}>
          <div className="nilmap__stat">
            <span className="num">50</span>
            <span className="label">States · college NIL</span>
          </div>
          <div className="nilmap__stat">
            <span className="num">45</span>
            <span className="label">States + DC · HS NIL</span>
          </div>
          <div className="nilmap__stat">
            <span className="num">&lt;24h</span>
            <span className="label">Auto state check</span>
          </div>
        </div>
      </div>
    </section>
  );
}
