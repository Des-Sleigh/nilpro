"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { startVerificationAction } from "@/app/signup/verify/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{
        width: "100%",
        justifyContent: "center",
        marginTop: "0.5rem",
      }}
    >
      {pending ? "Generating…" : "Generate my code →"}
    </button>
  );
}

export function VerifyForm({ error }: { error?: string }) {
  const [handle, setHandle] = useState<string>("");

  return (
    <form action={startVerificationAction} className="auth-form">
      {error ? (
        <div
          role="alert"
          style={{
            padding: "0.85rem 1rem",
            border: "1px solid var(--red)",
            background: "rgba(255, 58, 87, 0.08)",
            borderRadius: "var(--r-sm)",
            fontSize: "0.9rem",
            color: "var(--red)",
          }}
        >
          {error}
        </div>
      ) : null}

      <label className="auth-form__label">
        <span>Your Instagram handle</span>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0 0.85rem",
              background: "var(--bg-soft)",
              border: "2px solid #000",
              borderRight: "none",
              boxShadow: "0 0 0 1px var(--border-strong), 0 2px 0 #000",
              borderTopLeftRadius: "var(--r-sm)",
              borderBottomLeftRadius: "var(--r-sm)",
              color: "var(--text-muted)",
              fontFamily: "var(--mono)",
              fontSize: "1rem",
            }}
          >
            @
          </span>
          <input
            type="text"
            name="handle"
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="yourhandle"
            className="auth-form__input"
            style={{
              flex: 1,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              fontFamily: "var(--mono)",
            }}
          />
        </div>
      </label>

      {/* Platform is fixed to Instagram for verification. TikTok can be
          linked as a secondary social later on the profile page. */}
      <input type="hidden" name="platform" value="instagram" />

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        We verify every athlete via Instagram DM before any pitches go out under your name.
        Takes about 30 seconds. You can link TikTok from your profile later.
      </p>

      <SubmitButton />
    </form>
  );
}
