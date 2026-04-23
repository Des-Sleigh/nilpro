const STACKS = [1, 2, 3, 4] as const;

export function ReferralLadder() {
  return (
    <section className="section" style={{ paddingTop: "2rem" }}>
      <div className="container-page">
        <div className="section-head">
          <span className="label">THE MATH</span>
          <h2 style={{ marginTop: "1.25rem" }}>
            Every paid referral ={" "}
            <span className="accent-green">+50 pitches.</span>
          </h2>
          <p className="section-head__lede">
            Linear. No tiers. No milestones. One paid referral adds 50 pitches
            to your current year&apos;s allowance. Two adds 100. Ten adds 500.
          </p>
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            padding: "2rem 1.5rem",
            border: "1px solid var(--border)",
            background: "var(--bg-soft)",
            borderRadius: "var(--r-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            THE EQUATION
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              fontFamily: "var(--display)",
              fontWeight: 800,
            }}
          >
            <span
              style={{
                fontSize: "clamp(1.4rem, 3.2vw, 2rem)",
                color: "var(--text)",
              }}
            >
              1 paid referral
            </span>
            <span
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                color: "var(--green)",
              }}
            >
              =
            </span>
            <span
              style={{
                fontSize: "clamp(1.4rem, 3.2vw, 2rem)",
                color: "var(--green)",
                textShadow: "0 0 18px var(--green-glow)",
              }}
            >
              +50 pitches
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
            gap: "0.85rem",
          }}
        >
          {STACKS.map((n) => (
            <div
              key={n}
              style={{
                padding: "1.25rem 1rem",
                border: "1px solid var(--border-strong)",
                background: "var(--bg)",
                borderRadius: "var(--r-sm)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                }}
              >
                {n} REFERRAL{n === 1 ? "" : "S"}
              </div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--green)",
                  lineHeight: 1,
                  textShadow: "0 0 14px var(--green-glow)",
                }}
              >
                +{n * 50}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                extra pitches
              </div>
            </div>
          ))}
        </div>

        <div className="notebox" style={{ marginTop: "2rem" }}>
          <span className="notebox__head">HOW IT WORKS</span>
          Rewards apply once your friend&apos;s payment clears and verification
          passes. The 50 pitches get added to your current plan year — use them
          anytime in the next 12 months. No cap on how many referrals stack.
        </div>
      </div>
    </section>
  );
}
