"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction } from "@/app/signin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function SignInForm({
  error,
  message,
  next,
}: {
  error?: string;
  message?: string;
  next?: string;
}) {
  return (
    <form action={signInAction} className="auth-form">
      {message ? (
        <div
          role="status"
          className="auth-form__message auth-form__message--ok"
          style={{
            padding: "0.85rem 1rem",
            marginBottom: "1.25rem",
            border: "1px solid var(--green)",
            background: "var(--green-dim)",
            borderRadius: "var(--r-sm)",
            fontSize: "0.9rem",
            color: "var(--green)",
            fontFamily: "var(--mono)",
            letterSpacing: "0.04em",
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="auth-form__message auth-form__message--error"
          style={{
            padding: "0.85rem 1rem",
            marginBottom: "1.25rem",
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
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="auth-form__input"
        />
      </label>

      <input type="hidden" name="next" value={next ?? "/dashboard"} />

      <SubmitButton />

      <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem" }}>
        <Link
          href="/reset-password"
          style={{ color: "var(--text-muted)" }}
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
