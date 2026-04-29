"use client";

import Link from "next/link";
import { useState } from "react";
import { BillingToggle, type BillingPeriod } from "@/components/pricing/BillingToggle";

const TIERS = [
  {
    name: "Starter",
    monthly: 19,
    yearly: 99,
    desc: "Everything you need to land real deals.",
    features: [
      "Up to 100 local businesses pitched / year",
      "AI pitches you preview & approve",
      "Full response dashboard",
      "Contract templates",
      "Weekly activity digest",
      "Standard referral rewards",
    ],
    btnClass: "btn--ghost",
    cta: "Start starter",
    featured: false,
  },
  {
    name: "Pro",
    monthly: 39,
    yearly: 199,
    desc: "More reach. Better tools. Bigger network.",
    features: [
      "Everything in Starter",
      "Up to 500 businesses pitched / year",
      "AI follow-up automation",
      "Priority response monitoring",
      "Advanced deal analytics",
      "Enhanced referral rewards",
    ],
    btnClass: "btn--primary",
    cta: "Go pro",
    featured: true,
  },
  {
    name: "Champion",
    monthly: 79,
    yearly: 399,
    desc: "Full suite for athletes building a real brand.",
    features: [
      "Everything in Pro",
      "Unlimited businesses pitched",
      "Pro bio & press-kit generation",
      "Quarterly 1-on-1 strategy calls",
      "First access to new features",
      "Maximum referral multipliers",
    ],
    btnClass: "btn--dark",
    cta: "Go champion",
    featured: false,
  },
];

export function PricingTeaser() {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");

  return (
    <section
      className="section"
      style={{
        background: "var(--bg-soft)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-page">
        <div
          className="section-head"
          style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}
        >
          <span className="label" style={{ justifyContent: "center" }}>
            05 / THE LINEUP CARD
          </span>
          <h2 style={{ marginTop: "1.25rem" }}>
            Pick your <span className="accent-green">play.</span>
          </h2>
          <p
            className="section-head__lede"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            Free to sign up — see your target list and build your profile before you pay anything.
            Subscribe when you&apos;re ready to send pitches. Annual or monthly. Zero commission.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <BillingToggle value={period} onChange={setPeriod} />
        </div>

        <div className="pricing-grid">
          {TIERS.map((t) => {
            const amt = period === "yearly" ? t.yearly : t.monthly;
            const per = period === "yearly" ? "/YR" : "/MO";
            return (
              <div
                key={t.name}
                className={t.featured ? "tier tier--featured" : "tier"}
              >
                {t.featured && <div className="tier__badge">MOST CHOSEN</div>}
                <div className="tier__name">{t.name}</div>
                <div className="tier__price">
                  <span className="tier__amt">${amt}</span>
                  <span className="tier__per">{per}</span>
                </div>
                <div className="tier__desc">{t.desc}</div>
                <ul className="tier__features">
                  {t.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className={`btn ${t.btnClass} tier__cta`}>
                  {t.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/pricing" className="btn btn--ghost">
            See full pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
