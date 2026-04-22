"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { q: string; a: React.ReactNode };
type Category = { heading: string; items: Item[] };

const CATEGORIES: Category[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "How long does signup take?",
        a: (
          <p>
            About 5 minutes. Create an account, pay the $19 subscription, fill
            in your profile. We verify you within 24 hours and build your
            target list overnight — next day you review it and remove anyone
            you don&apos;t want contacted.
          </p>
        ),
      },
      {
        q: "What do I actually need on hand?",
        a: (
          <p>
            Credit card for the $19 subscription, your school and hometown
            info, and an <strong>Instagram or TikTok handle</strong> (required
            for verification — we have to confirm you&apos;re a real athlete
            before contacting businesses in your name). Photo is optional but
            recommended — businesses respond at a higher rate when there&apos;s
            a face.
          </p>
        ),
      },
      {
        q: "How do you verify that I'm a real athlete?",
        a: (
          <p>
            Two steps. First: you DM our Instagram (@nilpro) from the handle
            you signed up with, and we reply with a one-time code you enter in
            your dashboard — this proves you actually own the account. Second:
            we cross-reference your social content with the school and sport
            info you provided. If anything looks off, we may ask for a roster
            screenshot or a short video (5 seconds of you saying your name and
            school) before outreach starts. This protects you from someone
            signing up in your name, and protects local businesses from being
            pitched by people pretending to be athletes.
          </p>
        ),
      },
      {
        q: "Can I cancel if I change my mind?",
        a: (
          <p>
            Yes — full refund anytime{" "}
            <strong>before you approve your target list</strong>. Once outreach
            starts, no refund (we&apos;ve done the work), but you can cancel
            future renewals anytime. Most refund requests come in the first 48
            hours, which is well within the window.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Eligibility & legal",
    items: [
      {
        q: "Is NIL legal for me?",
        a: (
          <p>
            NCAA, NAIA, and NJCAA student-athletes (any division): yes,
            nationwide as of July 2021. HS level: roughly 40 states with
            specific restrictions. International student-athletes on visas face
            additional rules — consult compliance first. During signup we check
            your state and school and flag anything needing extra attention.
          </p>
        ),
      },
      {
        q: "Do I need to disclose deals to my school?",
        a: (
          <p>
            In most cases yes. Every school has its own rules — most require
            filing deals above a threshold (commonly $600/yr, or any deal). We
            provide a pre-filled disclosure packet for every deal you close so
            filing takes minutes, not hours.
          </p>
        ),
      },
      {
        q: "Are you an agent? Do I need to register you?",
        a: (
          <p>
            No. NILPro is a software tool. At signup you build a &ldquo;deal
            menu&rdquo; — checking boxes for deal types you&apos;ll accept
            (e.g., $50 per social post, monthly free meal for weekly posts,
            $200 event appearance). We pitch that menu to local businesses. We
            deliver their responses, but{" "}
            <strong>we never negotiate on your behalf</strong>. Counter-offers,
            price changes, or any deviation from your menu always come back to
            you to decide. No commission, no representation, no agency
            capacity. You do not need to register us.
          </p>
        ),
      },
      {
        q: "I'm under 18. Can I still use NILPro?",
        a: (
          <p>
            Yes, in states where HS NIL is legal. Parent or guardian co-signs
            your account. Contracts include parent signature lines. We email
            your parent at signup to approve the account before any outreach
            begins.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Outreach & control",
    items: [
      {
        q: "How many emails do you send per day?",
        a: (
          <p>
            10–20/day per athlete. Paced deliberately to stay out of spam
            filters, give you time to handle replies, and avoid overwhelming
            businesses in your area. Full round of 100–200 businesses takes 1–2
            weeks.
          </p>
        ),
      },
      {
        q: "Can I stop outreach mid-round?",
        a: <p>Anytime. One click pauses all outreach. Resume, restart, or cancel.</p>,
      },
      {
        q: "What if a business I don't want gets contacted?",
        a: (
          <p>
            It shouldn&apos;t — you review the full target list before any
            outreach, and anyone blacklisted is permanently excluded. If it
            does happen (bug, data error), email us — we apologize to the
            business and give you a month free.
          </p>
        ),
      },
      {
        q: "Do emails look like they're from me or NILPro?",
        a: (
          <p>
            Clearly from you — signed with your name, your school, your sport —
            with a small disclosure at the bottom noting the platform. Replies
            route to a unique address that forwards to you, so you see
            everything in your dashboard.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Results & money",
    items: [
      {
        q: "How many deals should I expect?",
        a: (
          <p>
            Honest answer: most athletes in our beta landed 1–3 deals in first
            90 days, mostly product/service. Cash deals are less common and
            tend to come from repeat outreach or referrals from businesses that
            know you. Mileage varies with sport, market, and social following.
          </p>
        ),
      },
      {
        q: "What kinds of deals are most common?",
        a: (
          <p>
            Product/service closes at roughly 3× cash. Weekly free meal. Gym
            membership. Monthly haircut. Family discount. These are the bread
            and butter of local NIL and what we prioritize in outreach.
          </p>
        ),
      },
      {
        q: "Do you take a cut of my deals?",
        a: (
          <p>
            Absolutely not. You keep 100%. We charge the $19/yr subscription
            and that&apos;s it. We never touch payment, never hold money, and
            have no claim to anything you earn.
          </p>
        ),
      },
      {
        q: "How do I actually get paid?",
        a: (
          <p>
            Directly from the business to you — Venmo, Zelle, check, direct
            deposit. Have a small conversation about payment method during deal
            negotiation. For product deals, the &ldquo;payment&rdquo; is the
            service or product itself.
          </p>
        ),
      },
      {
        q: "What about taxes?",
        a: (
          <p>
            NIL income is self-employment income. Business paying you $600+ in
            a year issues a 1099. You report it on your personal taxes. We
            provide year-end earnings summaries. Tax-prep add-on coming in year
            two.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Referrals",
    items: [
      {
        q: "How does the referral program work?",
        a: (
          <p>
            Every athlete gets a unique link. A friend signs up via your link
            AND pays → you earn rewards: <strong>+1 month</strong> added per
            referral, <strong>free Pro upgrade</strong> at 3 referrals,{" "}
            <strong>free next year at Pro</strong> at 5, and{" "}
            <strong>free year at Champion</strong> at 10. Rewards stack.{" "}
            <Link href="/referrals">See the full ladder →</Link>
          </p>
        ),
      },
      {
        q: "Do coaches get paid for referrals?",
        a: (
          <p>
            No. Coach partnerships are discounted team rates and operational
            support only — we deliberately avoid paying coaches for referrals
            because it creates conflict-of-interest issues for athletes.
          </p>
        ),
      },
    ],
  },
];

export function FaqList() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <section className="section" style={{ paddingTop: "2rem" }}>
      <div className="container-page" style={{ maxWidth: "52rem" }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.heading}>
            <div className="faq-head">{cat.heading}</div>
            <div>
              {cat.items.map((item, i) => {
                const key = `${cat.heading}-${i}`;
                const open = openKeys.has(key);
                return (
                  <div
                    className={`faq-item${open ? " open" : ""}`}
                    key={item.q}
                  >
                    <button
                      className="faq-item__q"
                      aria-expanded={open}
                      onClick={() => toggle(key)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-item__toggle">+</span>
                    </button>
                    <div className="faq-item__a">{item.a}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: "4rem",
            padding: "2rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
            Didn&apos;t find your question?
          </h3>
          <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>
            Email us at{" "}
            <strong style={{ color: "var(--green)" }}>hello@nilpro.com</strong>{" "}
            — we respond within 24 hours on weekdays.
          </p>
          <a href="mailto:hello@nilpro.com" className="btn btn--primary btn--sm">
            Contact support
          </a>
        </div>
      </div>
    </section>
  );
}
