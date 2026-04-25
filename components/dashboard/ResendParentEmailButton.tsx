"use client";

import { useFormStatus } from "react-dom";

type Props = {
  resendAction: (formData: FormData) => Promise<void>;
  /** True when the URL has ?email_resent=1 — show the success state for ~3s. */
  recentlySent?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`action-items__btn${pending ? " action-items__btn--pending" : ""}`}
      style={{
        minWidth: "8rem",
        textAlign: "center",
        opacity: pending ? 0.7 : 1,
        cursor: pending ? "wait" : "pointer",
      }}
    >
      {pending ? "Sending…" : "Resend email"}
    </button>
  );
}

export function ResendParentEmailButton({ resendAction, recentlySent }: Props) {
  if (recentlySent) {
    return (
      <div
        className="action-items__btn"
        role="status"
        style={{
          minWidth: "8rem",
          textAlign: "center",
          background: "var(--green-dim)",
          borderColor: "var(--green)",
          color: "var(--green)",
          cursor: "default",
          fontFamily: "var(--mono)",
          fontSize: "0.78rem",
          letterSpacing: "0.1em",
        }}
      >
        ✓ Email sent
      </div>
    );
  }

  return (
    <form action={resendAction}>
      <SubmitButton />
    </form>
  );
}
