import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — NILPro",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "28rem" }}>
        <div className="section-head" style={{ textAlign: "center" }}>
          <span className="label" style={{ justifyContent: "center" }}>
            WELCOME BACK
          </span>
          <h1 style={{ marginTop: "1.25rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Sign <span className="accent-green">in.</span>
          </h1>
        </div>

        <SignInForm error={params.error} message={params.message} next={params.next} />

        <p
          style={{
            marginTop: "2rem",
            textAlign: "center",
            fontSize: "0.92rem",
            color: "var(--text-muted)",
          }}
        >
          New to NILPro?{" "}
          <Link href="/signup" className="accent-green">
            Get started →
          </Link>
        </p>
      </div>
    </main>
  );
}
