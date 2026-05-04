"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlistAction } from "@/app/waitlist/actions";
import { track } from "@/lib/analytics/track";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

const LEVELS = [
  { v: "HS", label: "I'm a HS athlete" },
  { v: "College", label: "I'm a college athlete" },
  { v: "Parent", label: "I'm a parent of an athlete" },
  { v: "Coach", label: "I'm a coach / AD" },
  { v: "Business", label: "I'm a local business" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn--primary btn--lg"
      style={{ width: "100%" }}
      disabled={pending}
    >
      {pending ? "Saving…" : "Join the waitlist →"}
    </button>
  );
}

export function WaitlistForm({ error }: { error?: string }) {
  const [level, setLevel] = useState<string>("");
  const [source, setSource] = useState<string>("");

  // Capture utm_source / referrer once on mount, hidden field passes it
  // through to the server action.
  if (typeof window !== "undefined" && !source) {
    const url = new URL(window.location.href);
    const utm = url.searchParams.get("utm_source") || "";
    const ref = document.referrer || "";
    const captured = utm || (ref && !ref.includes(window.location.host) ? ref : "");
    if (captured) setSource(captured);
  }

  return (
    <form
      action={joinWaitlistAction}
      onSubmit={() =>
        track("waitlist_submitted", { level: level || null, source: source || null })
      }
      className="waitlist-form"
    >
      {error ? (
        <div className="waitlist-form__error" role="alert">
          {error}
        </div>
      ) : null}

      <label className="auth-form__label">
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className="auth-form__input"
        />
      </label>

      <label className="auth-form__label">
        <span>First name (optional)</span>
        <input
          type="text"
          name="first_name"
          autoComplete="given-name"
          className="auth-form__input"
        />
      </label>

      <div className="form-grid-2-1">
        <label className="auth-form__label">
          <span>I am a... (optional)</span>
          <select
            name="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="auth-form__input auth-form__select"
          >
            <option value="">Pick one</option>
            {LEVELS.map((l) => (
              <option key={l.v} value={l.v}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="auth-form__label">
          <span>State (optional)</span>
          <select
            name="state"
            defaultValue=""
            className="auth-form__input auth-form__select"
          >
            <option value="">State…</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="source" value={source} />

      <SubmitButton />

      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          textAlign: "center",
          marginTop: "0.6rem",
          lineHeight: 1.5,
        }}
      >
        We&apos;ll only email you when NILPro opens in your area. No spam, no
        list-trades, no marketing blasts.
      </p>
    </form>
  );
}
