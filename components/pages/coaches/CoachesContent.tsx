export function CoachesContent() {
  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container-page">
        <div className="two-col">
          <div className="prose">
            <h3>The problem you already know</h3>
            <p>
              Your star players get courted by collectives and booster groups.
              Everyone else gets nothing. You have track athletes, rowers,
              swimmers, JUCO baseball players, D2 volleyball starters — all with
              real local followings — and no path to the small deals that could
              help them afford to keep playing.
            </p>

            <h3>How NILPro fits</h3>
            <p>
              We&apos;re not an agent. We don&apos;t negotiate. We don&apos;t
              take commission. We handle the mechanical work of reaching out to
              local businesses on an athlete&apos;s behalf. Your athletes stay
              in control of every interaction. You stay out of the middle.
            </p>

            <h3>Team partnerships</h3>
            <p>
              If 5 or more of your athletes sign up, we set up a team dashboard
              so you can see participation at a high level (no personal
              financial data) and monitor compliance disclosures across your
              roster. You qualify for our coach partnership program.
            </p>

            <h3>What&apos;s included</h3>
            <ul>
              <li>
                Bulk team rate — <strong>discounted pricing</strong> at 10+
                signups (contact us for a quote)
              </li>
              <li>
                Team-level compliance dashboard (participation &amp; disclosure
                tracking)
              </li>
              <li>Quarterly sync on what&apos;s working, what isn&apos;t</li>
              <li>Priority onboarding for your signup cohort</li>
              <li>Extended rewards if your roster refers more athletes</li>
            </ul>

            <div className="notebox">
              <span className="notebox__head">IMPORTANT BOUNDARY</span>
              Coaches do NOT receive compensation from NILPro for referring
              athletes. Ever. That creates an agent-relationship risk for you
              and a conflict of interest for your athletes. Team partnerships
              are discounted rates and operational support only.
            </div>

            <h3>What it costs</h3>
            <p>
              Nothing to set up. Athletes subscribe at a discounted team rate
              (10+ signups required — contact us for a quote). Want to sponsor
              subscriptions out of athletic department funds? We invoice the
              school directly.
            </p>
          </div>

          <div>
            <div className="aside">
              <span className="label">TALK TO US</span>
              <h4 style={{ marginTop: "1rem" }}>Start the conversation</h4>
              <p>
                Tell us about your program. We&apos;ll send a one-page overview
                to share with your AD and set up a 20-minute call.
              </p>
              <div className="form-stack">
                <input type="text" placeholder="Your name" />
                <input type="text" placeholder="School" />
                <input type="email" placeholder="Email" />
                <input type="text" placeholder="Sport(s) / roster size" />
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "0.5rem",
                  }}
                >
                  Request overview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
