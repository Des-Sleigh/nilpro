import type { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export const metadata: Metadata = {
  title: "Join the NILPro waitlist",
  description:
    "Get notified when NILPro opens in your area. Free to join, no obligation.",
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    joined?: string;
    already?: string;
  }>;
}) {
  const params = await searchParams;
  const joined = params.joined === "1";
  const already = params.already === "1";

  return (
    <main className="waitlist-shell">
      <section className="waitlist-section">
        <div className="container-page" style={{ maxWidth: "44rem" }}>
          <div className="section-head" style={{ marginBottom: "1.5rem" }}>
            <span className="label">JOIN THE WAITLIST</span>
            <h1 style={{ marginTop: "1.25rem" }}>
              Be first when <span className="accent-green">NILPro</span> opens
              in your area.
            </h1>
            <p
              className="section-head__lede"
              style={{ marginTop: "1rem" }}
            >
              We&apos;re launching market-by-market with a small founding cohort.
              Drop your email and we&apos;ll let you know the moment NILPro is
              ready in your hometown — plus a heads-up before public signup
              opens to everyone.
            </p>
          </div>

          {joined ? (
            <div className="waitlist-success">
              <span className="label">You&apos;re in</span>
              <h2 style={{ marginTop: "1rem" }}>
                We&apos;ll be in <span className="accent-green">touch.</span>
              </h2>
              <p>
                Saved your spot. We&apos;ll email you the moment NILPro is live
                in your area — no spam, no list-trades, just one email when
                we&apos;re ready.
              </p>
            </div>
          ) : already ? (
            <div className="waitlist-success">
              <span className="label">Already on the list</span>
              <h2 style={{ marginTop: "1rem" }}>
                We&apos;ve <span className="accent-green">got you.</span>
              </h2>
              <p>
                You&apos;re already on the waitlist — we&apos;ll email you when
                we&apos;re ready. Don&apos;t worry, no duplicate email coming.
              </p>
            </div>
          ) : (
            <WaitlistForm error={params.error} />
          )}
        </div>
      </section>
    </main>
  );
}
