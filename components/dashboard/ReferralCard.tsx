"use client";

import { useState } from "react";

type Props = {
  referralCode: string;
  /** Count of signups that converted to paid via this code. */
  paidReferrals: number;
};

const BASE = "https://thenilpro.com/signup/create?ref=";
const PITCHES_PER_REFERRAL = 50;

export function ReferralCard({ referralCode, paidReferrals }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE}${referralCode}`;
  const shortUrl = url.replace(/^https?:\/\//, "");
  const pitchesEarned = paidReferrals * PITCHES_PER_REFERRAL;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* swallow */
      }
      document.body.removeChild(ta);
    }
  };

  const smsBody = encodeURIComponent(
    `Hey — sign up for NILPro with my link and I get 50 more pitches added to my year: ${url}`
  );
  const shareText = encodeURIComponent(
    `NILPro pitches local businesses for NIL deals on my behalf. Join with my link: ${url}`
  );

  return (
    <div className="dash-panel" id="referrals">
      <div className="dash-panel__head">
        <div className="dash-panel__title">Your referrals</div>
        <div className="dash-panel__meta">
          +{pitchesEarned} PITCHES EARNED
        </div>
      </div>
      <div className="referral-widget">
        <div className="rw-title">Refer a teammate — earn pitches</div>
        <div className="rw-sub">
          Every paid referral adds 50 pitches to this year&apos;s allowance.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            marginBottom: "0.85rem",
          }}
        >
          <div
            style={{
              padding: "0.65rem 0.75rem",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              borderRadius: "var(--r-sm)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "0.25rem",
              }}
            >
              Paid referrals
            </div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "var(--text)",
                lineHeight: 1,
              }}
            >
              {paidReferrals}
            </div>
          </div>
          <div
            style={{
              padding: "0.65rem 0.75rem",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              borderRadius: "var(--r-sm)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "0.25rem",
              }}
            >
              Pitches earned
            </div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "var(--green)",
                lineHeight: 1,
                textShadow: "0 0 10px var(--green-glow)",
              }}
            >
              +{pitchesEarned}
            </div>
          </div>
        </div>

        <div className="rw-link">
          <span className="rw-link__url" title={url}>
            {shortUrl}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className={`rw-link__copy${copied ? " rw-link__copy--done" : ""}`}
            aria-label="Copy referral link"
          >
            {copied ? "COPIED ✓" : "COPY"}
          </button>
        </div>

        <div className="rw-share">
          <a
            href={`sms:?&body=${smsBody}`}
            onClick={(e) => {
              if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                e.preventDefault();
                onCopy();
              }
            }}
          >
            SMS
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            POST
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(
              "Get local NIL deals on NILPro"
            )}&body=${shareText}`}
          >
            EMAIL
          </a>
        </div>
      </div>
    </div>
  );
}
