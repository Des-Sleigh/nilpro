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
      "Your terms pitched to every business",
      "Full response dashboard (Yes / No / Counter)",
      "Contract templates at your terms",
      "Pause & resume outreach anytime",
      "Standard referral rewards",
    ],
    cta: "Start starter",
    href: "/signup?tier=starter",
    btnClass: "btn--ghost",
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
    cta: "Go pro",
    href: "/signup?tier=pro",
    btnClass: "btn--primary",
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
    cta: "Go champion",
    href: "/signup?tier=champion",
    btnClass: "btn--dark",
    featured: false,
  },
];

export function PricingTiers() {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");

  return (
    <section className="section" style={{ paddingTop: "2rem" }}>
      <div className="container-page">
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
                <Link href={t.href} className={`btn ${t.btnClass} tier__cta`}>
                  {t.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            padding: "2rem",
            marginTop: "2rem",
            borderRadius: "var(--r-md)",
          }}
        >
          <span className="label">TEAM RATE</span>
          <h3 style={{ margin: "1rem 0 0.75rem" }}>
            Discounted bulk pricing for 10+ athletes
          </h3>
          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "0.95rem",
              maxWidth: "46rem",
            }}
          >
            Coaches and athletic departments can sign up groups of 10 or more at
            a discounted team rate. Team-level dashboard (no financial data) and
            compliance tracking included.{" "}
            <Link
              href="/coaches"
              style={{
                color: "var(--green)",
                textDecoration: "underline",
              }}
            >
              Learn more →
            </Link>
          </p>
        </div>

        <div style={{ marginTop: "4rem" }}>
          <h3
            style={{
              textAlign: "center",
              fontSize: "1.5rem",
              marginBottom: "1rem",
              color: "var(--text)",
            }}
          >
            Always included ·{" "}
            <span className="accent-green">regardless of tier</span>
          </h3>
          <div className="stat-bar">
            <div className="stat-bar__cell">
              <span className="stat-bar__num">0%</span>
              <span className="stat-bar__label">Commission on deals</span>
            </div>
            <div className="stat-bar__cell">
              <span className="stat-bar__num">ANYTIME</span>
              <span className="stat-bar__label">
                Pause, cancel, or refund pre-outreach
              </span>
            </div>
            <div className="stat-bar__cell">
              <span className="stat-bar__num">100%</span>
              <span className="stat-bar__label">Of earnings to you</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
