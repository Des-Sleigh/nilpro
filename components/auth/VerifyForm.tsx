"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { startVerificationAction } from "@/app/signup/verify/actions";

type Platform = "instagram" | "tiktok";

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
  const [platform, setPlatform] = useState<Platform>("instagram");
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
        <span>Platform</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(
            [
              { v: "instagram", label: "Instagram" },
              { v: "tiktok", label: "TikTok" },
            ] as const
          ).map((p) => {
            const active = platform === p.v;
            return (
              <button
                type="button"
                key={p.v}
                onClick={() => setPlatform(p.v)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  padding: "0.75rem 0.9rem",
                  border: `2px solid ${
                    active ? "var(--green)" : "var(--border-strong)"
                  }`,
                  background: active ? "var(--green-dim)" : "var(--bg-soft)",
                  color: active ? "var(--green)" : "var(--text-dim)",
                  fontFamily: "var(--cond)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "var(--r-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="platform" value={platform} required />
      </label>

      <label className="auth-form__label">
        <span>Your handle</span>
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

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        We verify every athlete before pitching on your behalf. Takes about
        30 seconds.
      </p>

      <SubmitButton />
    </form>
  );
}
