export function ReferralMechanics() {
  return (
    <section
      className="section"
      style={{
        paddingTop: "2rem",
        background: "var(--bg-soft)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-page">
        <div className="two-col">
          <div>
            <span className="label">HOW IT WORKS</span>
            <h2 style={{ marginTop: "1.25rem" }}>
              Share. They sign. <span className="accent-green">You win.</span>
            </h2>
            <p className="lede" style={{ marginTop: "1.25rem" }}>
              No complicated tracking codes or paperwork. Send your link, we
              handle the rest.
            </p>

            <div style={{ marginTop: "2rem" }}>
              <div className="mechanic">
                <span className="mechanic__num">01</span>
                <div className="mechanic__text">
                  <h4>Get your unique link</h4>
                  <p>
                    The moment you sign up you get a personal link:{" "}
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        color: "var(--green)",
                      }}
                    >
                      nilpro.com/join/YOURNAME
                    </span>
                    . Also a text-friendly code you can paste anywhere.
                  </p>
                </div>
              </div>
              <div className="mechanic">
                <span className="mechanic__num">02</span>
                <div className="mechanic__text">
                  <h4>Share it anywhere</h4>
                  <p>
                    Team group chat. Instagram DM. TikTok bio. Text message. We
                    make share buttons easy in your dashboard.
                  </p>
                </div>
              </div>
              <div className="mechanic">
                <span className="mechanic__num">03</span>
                <div className="mechanic__text">
                  <h4>They sign up &amp; pay</h4>
                  <p>
                    Your friend uses your link or code at checkout. They pay.
                    They get verified. Rewards trigger automatically.
                  </p>
                </div>
              </div>
              <div className="mechanic">
                <span className="mechanic__num">04</span>
                <div className="mechanic__text">
                  <h4>+50 pitches land</h4>
                  <p>
                    The moment they pay, 50 pitches drop into your current
                    year&apos;s allowance. You see the new total in your
                    dashboard immediately. No forms, no waiting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="share-mock">
              <div className="share-mock__head">
                <div className="share-mock__title">Your referral link</div>
                <div className="share-mock__copy">COPY</div>
              </div>
              <div className="share-mock__link">
                <span>nilpro.com/join/MAYA-R</span>
                <span style={{ color: "var(--text-muted)" }}>◎</span>
              </div>
              <div className="share-mock__progress">
                <div className="share-mock__progress-label">
                  <span>Pitches earned · this year</span>
                  <strong>+50</strong>
                </div>
                <div className="share-mock__bar">
                  <div className="share-mock__bar-fill"></div>
                </div>
              </div>
              <div className="share-mock__stats">
                <div className="share-mock__stat">
                  <div className="share-mock__stat-num">1</div>
                  <div className="share-mock__stat-label">Signed &amp; paid</div>
                </div>
                <div className="share-mock__stat">
                  <div className="share-mock__stat-num">2</div>
                  <div className="share-mock__stat-label">Pending</div>
                </div>
                <div className="share-mock__stat">
                  <div className="share-mock__stat-num">+50</div>
                  <div className="share-mock__stat-label">Pitches earned</div>
                </div>
              </div>
            </div>

            <div className="notebox" style={{ marginTop: "1.5rem" }}>
              <span className="notebox__head">KEEPING IT CLEAN</span>
              Referrer must be an active paid member. Referred athlete must pass
              verification (real athlete, real school, real social). Rewards
              apply once payment clears and verification passes. No fake
              signups, no duplicate accounts, no chain schemes.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
