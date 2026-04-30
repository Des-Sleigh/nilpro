import Link from "next/link";

const STEPS: { num: string; title: string; body: React.ReactNode }[] = [
  {
    num: "01",
    title: "Build your profile · 5 minutes",
    body: (
      <>
        Name, sport, position, school, graduation year, hometown, school city,
        Instagram OR TikTok handle. Photo is optional. We draft a one-sentence
        bio from your info — edit it or keep it.
      </>
    ),
  },
  {
    num: "02",
    title: "Verification · same-day",
    body: (
      <>
        DM our Instagram account from the handle you signed up with — we reply
        with a one-time code to enter in your dashboard. This proves you own the
        account. We also cross-reference your social content with your school
        and sport. This protects your name and keeps local businesses confident
        they&apos;re talking to real athletes.
      </>
    ),
  },
  {
    num: "03",
    title: "Build your deal menu",
    body: (
      <>
        This is the most important step. Check the boxes for deal types
        you&apos;ll accept: cash per social post ($1–500), product/service
        deals (meals, gym access, etc. — you pick the frequency), or in-store
        appearances ($1–500). Each checkbox has a default amount — adjust up
        or down to set your minimum. Also pick which cities we&apos;ll pitch
        in (your hometown is pre-added) and which business categories
        interest you.
      </>
    ),
  },
  {
    num: "04",
    title: "Your target list populates instantly",
    body: (
      <>
        As soon as you pick your cities and categories, we pull hundreds of
        local businesses from that area — name, address, category, rating —
        and show them to you on the next screen. No waiting.
      </>
    ),
  },
  {
    num: "05",
    title: "Review & remove anyone you don't want",
    body: (
      <>
        Nothing sends until you say go. See every business on the list. Remove
        individuals or bulk-remove by category. Add names to your skip list and
        they&apos;re never pitched again — even in future rounds. One click
        starts outreach.
      </>
    ),
  },
  {
    num: "06",
    title: "Outreach goes out — from you, paced to stay effective",
    body: (
      <>
        NILPro writes each pitch to the specific business — their location,
        their reviews, why you&apos;d be a good fit — and queues it in your
        dashboard. You hit send (or have NILPro relay it from your connected
        inbox) so the From line is always you. Paced to stay out of spam
        filters. Pause anytime in one click.
      </>
    ),
  },
  {
    num: "07",
    title: "Responses land · 7–14 days",
    body: (
      <>
        Every reply falls into one of three buckets in your dashboard:{" "}
        <strong>YES</strong> (business accepts your terms),{" "}
        <strong>COUNTER</strong> (business offers different terms), or{" "}
        <strong>NO</strong> (not interested). You see them all as they come in.
      </>
    ),
  },
  {
    num: "08",
    title: "Yes-responses come back ready to sign",
    body: (
      <>
        When a business says yes to your terms, NILPro auto-fills our contract
        template with those exact terms — compensation, deliverables, timeline,
        compliance reminders. You review and sign. If a business counters,
        NILPro surfaces the counter in your dashboard and gives you a one-click
        reply template — you send the response from your own inbox, every time.
      </>
    ),
  },
  {
    num: "09",
    title: "Deliver & get paid",
    body: (
      <>
        Payment goes direct from the business to you (Venmo, Zelle, check —
        whatever you set up). Post the promoted content. Log the deal in your
        dashboard. Watch your portfolio grow — every closed deal makes the next
        one easier.
      </>
    ),
  },
];

export function StepByStep() {
  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container-page">
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.num}>
              <span className="steps__num">{s.num}</span>
              <div className="steps__content">
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="stat-bar">
          <div className="stat-bar__cell">
            <span className="stat-bar__num">5 MIN</span>
            <span className="stat-bar__label">Signup time</span>
          </div>
          <div className="stat-bar__cell">
            <span className="stat-bar__num">24 HRS</span>
            <span className="stat-bar__label">Target list ready</span>
          </div>
          <div className="stat-bar__cell">
            <span className="stat-bar__num">7–14D</span>
            <span className="stat-bar__label">First responses</span>
          </div>
        </div>

        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <Link href="/signup" className="btn btn--primary btn--lg">
            Start your profile →
          </Link>
        </div>
      </div>
    </section>
  );
}
