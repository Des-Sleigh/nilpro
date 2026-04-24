"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updatePasswordAction } from "@/app/update-password/actions";

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
      {pending ? "Saving…" : "Set new password"}
    </button>
  );
}

export function UpdatePasswordForm({ error }: { error?: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <form action={updatePasswordAction} className="auth-form">
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
        <span>New password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-form__input"
        />
      </label>

      <label className="auth-form__label">
        <span>Confirm new password</span>
        <input
          type="password"
          name="password_confirm"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="auth-form__input"
          aria-invalid={mismatch || undefined}
        />
        {mismatch ? (
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--red)",
              fontFamily: "var(--mono)",
              letterSpacing: "0.04em",
            }}
          >
            Passwords don&apos;t match.
          </span>
        ) : null}
      </label>

      <SubmitButton />
    </form>
  );
}
