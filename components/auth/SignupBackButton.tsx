"use client";

import { useRouter } from "next/navigation";

/** Browser-history back. Lives in SignupShell. Hidden on step 1 since
 *  /signup/create has no meaningful previous step inside our flow. */
export function SignupBackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--text-faint)",
        fontFamily: "var(--mono)",
        fontSize: "0.7rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        padding: 0,
      }}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}
