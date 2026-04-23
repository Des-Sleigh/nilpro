"use client";

import { useState } from "react";

type Props = {
  referralCode: string;
  /** Count of signups that converted to paid via this code. */
  paidReferrals: number;
  /** Number needed to hit the next tier (default 3 for Pro). */
  goal?: number;
};

const BASE = "https://thenilpro.com/signup/create?ref=";

export function ReferralCard({ referralCode, paidReferrals, goal = 3 }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE}${referralCode}`;
  const shortUrl = url.replace(/^https?:\/\//, "");
  const progress = Math.min(100, Math.round((paidReferrals / goal) * 100));

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can fail on older browsers / insecure contexts — fall back
      // to select+copy via a hidden textarea.
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
    `Hey — sign up for NILPro with my link and I get a free month on my plan: ${url}`
  );
  const shareText = encodeURIComponent(
    `NILPro pitches local businesses for NIL deals on my behalf. Join with my link: ${url}`
  );

  return (
    <div className="dash-panel">
      <div className="dash-panel__head">
        <div className="dash-panel__title">Your referrals</div>
        <div className="dash-panel__meta">
          {paidReferrals} / {goal} TO PRO
        </div>
      </div>
      <div className="referral-widget">
        <div className="rw-title">Refer teammates, earn free months</div>
        <div className="rw-sub">
          Next: free Pro upgrade at {goal} paid referrals
        </div>

        <div className="rw-link">
          <span className="rw-link__url" title={url}>{shortUrl}</span>
          <button
            type="button"
            onClick={onCopy}
            className={`rw-link__copy${copied ? " rw-link__copy--done" : ""}`}
            aria-label="Copy referral link"
          >
            {copied ? "COPIED ✓" : "COPY"}
          </button>
        </div>

        <div className="rw-progress">
          <div className="rw-progress__label">
            <span>Signed &amp; paid</span>
            <strong>
              {paidReferrals} / {goal}
            </strong>
          </div>
          <div className="rw-progress__bar">
            <div
              className="rw-progress__bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rw-share">
          <a
            href={`sms:?&body=${smsBody}`}
            onClick={(e) => {
              // Best-effort — mobile native sms:, on desktop we just copy.
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
