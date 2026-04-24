"use client";

import { useFormStatus } from "react-dom";
import { sendResetEmailAction } from "@/app/reset-password/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn btn--primary btn--lg${pending ? " btn--pending" : ""}`}
      style={{
        width: "100%",
        justifyContent: "center",
        marginTop: "0.5rem",
      }}
    >
      {pending ? "Sending…" : "Email me a reset link"}
    </button>
  );
}

export function ResetPasswordForm({ error }: { error?: string }) {
  return (
    <form action={sendResetEmailAction} className="auth-form">
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

      <SubmitButton />
    </form>
  );
}
