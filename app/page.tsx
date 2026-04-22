import Link from "next/link";
import { PlaceholderHero } from "@/components/PlaceholderHero";

export default function Home() {
  return (
    <>
      <PlaceholderHero
        eyebrow="EVERY HS + COLLEGE ATHLETE · EVERY SPORT · EVERY LEVEL"
        title="Local NIL. Real deals."
        accent="Your hometown."
        body="NILPro pitches hometown businesses on your behalf. You sign real deals — free meals, gear, cash for posts, and more. Built for every high school and college athlete. Every sport. Every level."
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-page flex flex-col sm:flex-row gap-4">
          <Link href="/signup" className="btn btn--primary btn--lg">
            Get in the game
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/how-it-works" className="btn btn--ghost btn--lg">
            How it works
          </Link>
        </div>
      </section>
    </>
  );
}
