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
        you&apos;ll accept: cash per social post ($25–300), product/service
        deals (meals, gym access, etc. — you pick the frequency), appearances
        ($50–500), or mutual promotion (zero-cost). Each checkbox has a default
        amount — adjust up or down to set your minimum. Also pick which cities
        we&apos;ll pitch in (your hometown and school city are pre-added) and
        which business categories interest you.
      </>
    ),
  },
  {
    num: "04",
    title: "We build your target list · 24 hours",
    body: (
      <>
        Overnight, we pull 100–200 local businesses in your radius, filtered by
        preferences. Each gets a short &quot;why we picked them&quot; so you
        understand the reasoning.
      </>
    ),
  },
  {
    num: "05",
    title: "Review & remove anyone you don't want",
    body: (
      <>
        Nothing sends until you say go. See every business on the list. Remove
        individuals, bulk-remove by category, bulk-remove by zip code. Anyone
        you take off gets permanently excluded — they&apos;ll never be
        contacted, even in future rounds. One click starts outreach.
      </>
    ),
  },
  {
    num: "06",
    title: "Outreach fires · 10–20/day",
    body: (
      <>
        Paced to stay out of spam filters. Every email personalized to that
        specific business — their location, their reviews, why you&apos;d be a
        good fit for them. Pause outreach anytime in one click.
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
        When a business says yes to your terms, we draft the contract with those
        exact terms — compensation, deliverables, timeline, compliance
        disclosures. You review and sign. If a business counters, we show you
        their offer and you decide: accept, reject, or counter back. We pass
        your response along — no negotiation work on your end unless you want
        to engage.
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
