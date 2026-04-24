import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — NILPro",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If they're already signed in, they can just change their password from
  // /update-password — no need for the reset email round-trip.
  if (user) {
    redirect("/update-password");
  }

  const { error, sent, email } = await searchParams;

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "28rem" }}>
        <div className="section-head" style={{ textAlign: "center" }}>
          <span className="label" style={{ justifyContent: "center" }}>
            FORGOT YOUR PASSWORD?
          </span>
          <h1
            style={{ marginTop: "1.25rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Reset it <span className="accent-green">here.</span>
          </h1>
        </div>

        {sent ? (
          <div
            role="status"
            style={{
              marginTop: "2rem",
              padding: "1.25rem",
              border: "1px solid var(--green)",
              background: "var(--green-dim)",
              borderRadius: "var(--r-md)",
              color: "var(--text)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--green)",
                fontWeight: 700,
                marginBottom: "0.4rem",
              }}
            >
              ● CHECK YOUR INBOX
            </div>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-dim)" }}>
              If an account exists for{" "}
              {email ? (
                <strong style={{ color: "var(--text)" }}>{email}</strong>
              ) : (
                "that email"
              )}
              , we sent a link to reset your password.
            </p>
          </div>
        ) : (
          <ResetPasswordForm error={error} />
        )}

        <p
          style={{
            marginTop: "2rem",
            textAlign: "center",
            fontSize: "0.92rem",
            color: "var(--text-muted)",
          }}
        >
          Remembered it?{" "}
          <Link href="/signin" className="accent-green">
            Back to sign in →
          </Link>
        </p>
      </div>
    </main>
  );
}
