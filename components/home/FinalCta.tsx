import Link from "next/link";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function FinalCta({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <section className="final-cta">
      <div className="container-page">
        <div className="final-cta__inner">
          <h2>
            Your hometown has <em>money</em> for you.
          </h2>
          <p>
            Five minutes to set up. Twenty-nine dollars a year. Zero commission. You approve
            every move. Let&apos;s get you paid.
          </p>
          <div className="hero__ctas" style={{ justifyContent: "center" }}>
            <Link
              href={isSignedIn ? "/dashboard" : "/signup"}
              className="btn btn--primary btn--lg"
            >
              {isSignedIn ? "Go to dashboard" : "Start your profile"}
              <ArrowIcon />
            </Link>
            <Link href="/how-it-works" className="btn btn--ghost btn--lg">
              How it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
