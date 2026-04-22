import type { Metadata } from "next";
import Link from "next/link";
import { SignupShell } from "@/components/auth/SignupShell";

export const metadata: Metadata = {
  title: "Check your email — NILPro",
};

export default async function CheckEmail({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <SignupShell
      step={1}
      eyebrow="ONE MORE CLICK"
      title={
        <>
          Check your <span className="accent-green">inbox.</span>
        </>
      }
    >
      <p className="lede" style={{ marginBottom: "1.5rem" }}>
        We sent a confirmation link{email ? ` to ` : "."}
        {email ? <strong style={{ color: "var(--text)" }}>{email}</strong> : null}.
        Click the link to activate your account and continue.
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        Wrong email?{" "}
        <Link href="/signup/create" className="accent-green">
          Start over →
        </Link>
      </p>
      <p
        style={{
          color: "var(--text-faint)",
          fontSize: "0.82rem",
          marginTop: "2rem",
          fontFamily: "var(--mono)",
          letterSpacing: "0.08em",
        }}
      >
        Didn&apos;t get the email? Check spam, or wait a minute and try again.
      </p>
    </SignupShell>
  );
}
