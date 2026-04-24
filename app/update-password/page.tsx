import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Update password — NILPro",
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This page is only reachable after following a reset-password email
  // link (which sets the session via /auth/callback) OR while already
  // signed in. Anyone else → kick to /signin.
  if (!user) {
    redirect("/signin");
  }

  const { error } = await searchParams;

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "28rem" }}>
        <div className="section-head" style={{ textAlign: "center" }}>
          <span className="label" style={{ justifyContent: "center" }}>
            NEW PASSWORD
          </span>
          <h1
            style={{ marginTop: "1.25rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Set a <span className="accent-green">new password.</span>
          </h1>
        </div>
        <UpdatePasswordForm error={error} />
      </div>
    </main>
  );
}
