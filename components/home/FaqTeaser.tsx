"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { q: string; a: React.ReactNode };

const ITEMS: Item[] = [
  {
    q: "Is this legal for my sport / state / school?",
    a: (
      <p>
        NIL is legal for college athletes in all 50 states (NCAA, NAIA, NJCAA). HS NIL is
        permitted in roughly 40 states with specific rules — we check automatically during
        signup. International athletes: confirm with compliance first.
      </p>
    ),
  },
  {
    q: "What if the wrong business gets contacted?",
    a: (
      <p>
        It won&apos;t. You review every business on your target list before any email sends.
        You can kill individuals, entire categories (no restaurants), or entire zip codes.
        Blacklist is permanent — once out, forever out.
      </p>
    ),
  },
  {
    q: "What if I don't get any deals?",
    a: (
      <p>
        We keep working until you do. Most deals close in the 30–60 day window, and
        product/service deals (free meals, gym memberships) close at higher rates than cash.
        If you want out, you can cancel future renewals anytime.
      </p>
    ),
  },
  {
    q: "How do you make money if you don't take commission?",
    a: (
      <p>
        The $19/year subscription. That&apos;s it. No commission by design — it protects you
        legally (we&apos;re not an agent), keeps our incentives aligned, and lets you keep 100%
        of everything you earn.
      </p>
    ),
  },
  {
    q: "I'm under 18. Can I still sign up?",
    a: (
      <p>
        Yes, in states where HS NIL is legal. Parent co-signs the account and approves
        outreach with you. All contracts include parent signature lines. See the{" "}
        <Link href="/parents">parent page</Link>.
      </p>
    ),
  },
];

export function FaqTeaser() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="section">
      <div className="container-page" style={{ maxWidth: "48rem" }}>
        <div
          className="section-head"
          style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}
        >
          <span className="label" style={{ justifyContent: "center" }}>
            06 / REAL QUESTIONS
          </span>
          <h2 style={{ marginTop: "1.25rem" }}>
            Straight <span className="accent-green">answers.</span>
          </h2>
        </div>

        <div>
          {ITEMS.map((item, i) => {
            const open = openIdx === i;
            return (
              <div className={`faq-item${open ? " open" : ""}`} key={item.q}>
                <button
                  className="faq-item__q"
                  aria-expanded={open}
                  onClick={() => setOpenIdx(open ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-item__toggle">+</span>
                </button>
                <div className="faq-item__a">{item.a}</div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/faq" className="btn btn--ghost">
            All FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
}
