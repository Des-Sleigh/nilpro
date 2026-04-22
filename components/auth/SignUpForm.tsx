"use client";

import { useFormStatus } from "react-dom";
import { signUpAction } from "@/app/signup/create/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export function SignUpForm({
  error,
  referralCode,
}: {
  error?: string;
  referralCode?: string;
}) {
  return (
    <form action={signUpAction} className="auth-form">
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
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="auth-form__input"
        />
      </label>

      {referralCode ? (
        <input type="hidden" name="ref" value={referralCode} />
      ) : null}

      <SubmitButton />

      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          lineHeight: 1.5,
          marginTop: "0.5rem",
        }}
      >
        By creating an account you agree to our Terms and Privacy Policy. NILPro is
        a software platform, not an agent — we never negotiate or hold money on your
        behalf.
      </p>
    </form>
  );
}
