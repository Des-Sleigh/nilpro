import Link from "next/link";

const HUDDLE_ITEMS = [
  "Types of deals they're comfortable promoting (product vs cash, content style).",
  "School's NIL disclosure policy (athletic dept site).",
  "Realistic expectation: most deals are $50–500 and product-based.",
  "Plan to review the target list together when it's ready (day 2) — blacklist any business you don't want contacted.",
  "Who decides: your student approves outreach, you co-sign contracts.",
];

export function Worries() {
  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container-page">
        <div className="two-col">
          <div>
            <div className="worry">
              <div className="worry__q">Is this legitimate, or a scam?</div>
              <div className="worry__a">
                Fair question — there are a lot of bad NIL actors out there.
                We&apos;re an early-stage company and trust is earned, not
                claimed. Here&apos;s what&apos;s already true: we never handle
                your athlete&apos;s money (all payments go directly from the
                business to them), we charge a flat annual fee disclosed up
                front, and full refunds are available anytime before outreach
                begins. Anything feels off? Email{" "}
                <strong style={{ color: "var(--text)" }}>
                  hello@nilpro.com
                </strong>
                .
              </div>
            </div>
            <div className="worry">
              <div className="worry__q">
                Will this get my kid in trouble with their school?
              </div>
              <div className="worry__a">
                NIL is permitted at every NCAA level and in ~40 states at the HS
                level, but each school has its own disclosure rules. We build
                compliance disclosures into every contract (FTC #ad, state NIL
                rules, school notification reminders). Your student still files
                with their athletic department — we make it easy with a
                pre-filled disclosure packet.
              </div>
            </div>
            <div className="worry">
              <div className="worry__q">Is my kid&apos;s information safe?</div>
              <div className="worry__a">
                We collect the minimum: name, school, sport, hometown, one
                photo, Instagram. We don&apos;t sell data, share with
                advertisers, or expose info to third parties beyond the outreach
                email itself. Full privacy policy in the footer.
              </div>
            </div>
            <div className="worry">
              <div className="worry__q">
                Who signs the contracts if my child is a minor?
              </div>
              <div className="worry__a">
                You do. For athletes under 18, our contract templates include
                parent/guardian signature lines. We also require parent consent
                at signup for minors — you&apos;ll get an email to co-approve
                the account before outreach begins.
              </div>
            </div>
            <div className="worry">
              <div className="worry__q">What about taxes?</div>
              <div className="worry__a">
                NIL income is self-employment income. Your athlete will receive
                1099s from any business paying them $600+. We don&apos;t do tax
                prep in v1 (coming later), but we link to NIL-specialized tax
                resources and provide year-end earnings summaries from your
                dashboard to make filing easier.
              </div>
            </div>
          </div>

          <div>
            <div className="aside">
              <span className="label">HUDDLE UP</span>
              <h4 style={{ marginTop: "1rem" }}>
                A 20-min convo before signup
              </h4>
              <p>
                If your athlete is under 18, sit down with them and walk through
                these together:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0" }}>
                {HUDDLE_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "0.6rem 0",
                      borderTop: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      display: "flex",
                      gap: "0.75rem",
                      color: "var(--text-dim)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--green)",
                        fontFamily: "var(--mono)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        minWidth: "1.5rem",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn btn--primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Get the parent guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
