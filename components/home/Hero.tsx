import Link from "next/link";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="hero">
      <div className="container-page">
        <div className="hero__grid">
          <div>
            <div className="hero__badge">
              <span>
                <span className="dot"></span> EVERY HS + COLLEGE ATHLETE · EVERY SPORT · EVERY LEVEL
              </span>
            </div>

            <h1 className="hero__headline">
              <span className="hl-line">LOCAL NIL.</span>
              <span className="hl-line">REAL DEALS.</span>
              <span className="hl-line hl-green">YOUR HOMETOWN.</span>
            </h1>

            <p className="hero__sub">
              NILPro pitches hometown businesses on your behalf. You sign real deals —{" "}
              <strong>free meals, gear, cash for posts, and more</strong>. Built for every high
              school and college athlete. Every sport. Every level.
            </p>

            <div className="hero__ctas">
              <Link href="/signup" className="btn btn--primary btn--lg">
                Get in the game
                <ArrowIcon />
              </Link>
              <Link href="/how-it-works" className="btn btn--ghost btn--lg">
                How it works
              </Link>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <div className="hero__stat-num">$19</div>
                <div className="hero__stat-label">Per year · Flat</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-num">0%</div>
                <div className="hero__stat-label">Commission on deals</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-num">
                  200
                  <span style={{ fontSize: "0.6em", color: "var(--text-muted)" }}>+</span>
                </div>
                <div className="hero__stat-label">Local businesses pitched</div>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="slip slip--1">
              <div className="slip__head">
                <div className="slip__badge">
                  <span className="dot"></span> CLOSED
                </div>
                <div className="slip__date">MAR 14 · 9:42A</div>
              </div>
              <div className="slip__athlete">
                <div className="slip__avatar">MR</div>
                <div>
                  <div className="slip__name">Maya R.</div>
                  <div className="slip__meta">D3 SOCCER · WACO TX</div>
                </div>
              </div>
              <div className="slip__deal">
                <div className="slip__deal-biz">La Cocina de Abuela</div>
                <div className="slip__deal-desc">
                  Monthly meals + 2 posts/mo — 6 month term
                </div>
              </div>
              <div className="slip__amt">
                <span className="slip__amt-label">Deal value</span>
                <span className="slip__amt-val">$720</span>
              </div>
            </div>

            <div className="slip slip--2">
              <div className="slip__head">
                <div className="slip__badge">
                  <span className="dot"></span> PENDING
                </div>
                <div className="slip__date">MAR 14 · 11:18A</div>
              </div>
              <div className="slip__athlete">
                <div className="slip__avatar">JT</div>
                <div>
                  <div className="slip__name">Jordan T.</div>
                  <div className="slip__meta">JUCO BASEBALL · TOLEDO OH</div>
                </div>
              </div>
              <div className="slip__deal">
                <div className="slip__deal-biz">Revolution Fitness</div>
                <div className="slip__deal-desc">
                  Seasonal membership + posts during season
                </div>
              </div>
              <div className="slip__amt">
                <span className="slip__amt-label">Est. value</span>
                <span className="slip__amt-val">$450</span>
              </div>
            </div>

            <div className="slip slip--3">
              <div className="slip__head">
                <div className="slip__badge">
                  <span className="dot"></span> NEW
                </div>
                <div className="slip__date">MAR 14 · 1:05P</div>
              </div>
              <div className="slip__athlete">
                <div className="slip__avatar">SK</div>
                <div>
                  <div className="slip__name">Sam K.</div>
                  <div className="slip__meta">D1 TRACK · EUGENE OR</div>
                </div>
              </div>
              <div className="slip__deal">
                <div className="slip__deal-biz">Tracktown Running</div>
                <div className="slip__deal-desc">Gear package + 3 posts this season</div>
              </div>
              <div className="slip__amt">
                <span className="slip__amt-label">Deal value</span>
                <span className="slip__amt-val">$250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
