import Link from "next/link";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function UtensilsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 002-2V2M5 11v11M14 2c-1.1 0-2 1-2 2v6c0 1.1.9 2 2 2h0V2zM18 2v20" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5v14M2 9v6M18 5v14M22 9v6M6 12h12" />
    </svg>
  );
}

function ShoeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h18a0 0 0 010 0v0a2 2 0 01-2 2H5a2 2 0 01-2-2v0z" />
      <path d="M3 18l1-7c.2-1.4 1.4-2.4 2.8-2.4h2.5l1.5 2.5L13 12h5l3 3v3" />
    </svg>
  );
}

export function Hero({ isSignedIn = false }: { isSignedIn?: boolean }) {
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
              <Link
                href={isSignedIn ? "/dashboard" : "/signup"}
                className="btn btn--primary btn--lg"
              >
                {isSignedIn ? "Go to dashboard" : "Get in the game"}
                <ArrowIcon />
              </Link>
              <Link href="/how-it-works" className="btn btn--ghost btn--lg">
                How it works
              </Link>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <div className="hero__stat-num">$99</div>
                <div className="hero__stat-label">Per year · Starter</div>
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
                  <CheckIcon /> CLOSED
                </div>
                <div className="slip__date">MAR 14, 2025 · 9:42 AM</div>
              </div>
              <div className="slip__athlete">
                <div className="slip__avatar">MR</div>
                <div>
                  <div className="slip__name">Maya R.</div>
                  <div className="slip__meta">D3 SOCCER · WACO TX</div>
                </div>
              </div>
              <div className="slip__deal">
                <div className="slip__deal-icon">
                  <UtensilsIcon />
                </div>
                <div className="slip__deal-body">
                  <div className="slip__deal-biz">La Cocina de Abuela</div>
                  <div className="slip__deal-desc">Monthly meals + 2 posts/mo</div>
                  <div className="slip__deal-term">
                    <CalendarIcon /> 6 month term
                  </div>
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
                  <CheckIcon /> CLOSED
                </div>
                <div className="slip__date">MAR 14, 2025 · 11:18 AM</div>
              </div>
              <div className="slip__athlete">
                <div className="slip__avatar">JP</div>
                <div>
                  <div className="slip__name">Jordan P.</div>
                  <div className="slip__meta">D2 BASKETBALL · AUSTIN TX</div>
                </div>
              </div>
              <div className="slip__deal">
                <div className="slip__deal-icon">
                  <DumbbellIcon />
                </div>
                <div className="slip__deal-body">
                  <div className="slip__deal-biz">Revolution Fitness</div>
                  <div className="slip__deal-desc">
                    Seasonal membership + posts during season
                  </div>
                  <div className="slip__deal-term">
                    <CalendarIcon /> 6 month term
                  </div>
                </div>
              </div>
              <div className="slip__amt">
                <span className="slip__amt-label">Deal value</span>
                <span className="slip__amt-val">$450</span>
              </div>
            </div>

            <div className="slip slip--3">
              <div className="slip__head">
                <div className="slip__badge">
                  <CheckIcon /> CLOSED
                </div>
                <div className="slip__date">MAR 14, 2025 · 1:05 PM</div>
              </div>
              <div className="slip__athlete">
                <div className="slip__avatar">AC</div>
                <div>
                  <div className="slip__name">Alex C.</div>
                  <div className="slip__meta">TRACK & FIELD · COLLEGE STATION TX</div>
                </div>
              </div>
              <div className="slip__deal">
                <div className="slip__deal-icon">
                  <ShoeIcon />
                </div>
                <div className="slip__deal-body">
                  <div className="slip__deal-biz">Stride Performance</div>
                  <div className="slip__deal-desc">Training package + 1 post/mo</div>
                  <div className="slip__deal-term">
                    <CalendarIcon /> 3 month term
                  </div>
                </div>
              </div>
              <div className="slip__amt">
                <span className="slip__amt-label">Deal value</span>
                <span className="slip__amt-val">$300</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
