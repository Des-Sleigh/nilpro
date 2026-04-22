import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create account — NILPro",
};

export default async function CreateAccount({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in? Skip to whichever step makes sense.
  if (user) {
    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    redirect(athlete ? "/dashboard" : "/signup/profile");
  }

  const params = await searchParams;

  return (
    <SignupShell
      step={1}
      eyebrow="CREATE ACCOUNT"
      title={
        <>
          Let&apos;s <span className="accent-green">get you in.</span>
        </>
      }
      footer={
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/signin" className="accent-green">
            Sign in →
          </Link>
        </p>
      }
    >
      <SignUpForm error={params.error} referralCode={params.ref} />
    </SignupShell>
  );
}
