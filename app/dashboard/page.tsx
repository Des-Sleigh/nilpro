import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — NILPro",
};

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/dashboard");
  }

  const { data: athlete } = await supabase
    .from("athletes")
    .select("first_name, last_name, sport, school, level, referral_code")
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) {
    redirect("/signup/profile");
  }

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "40rem" }}>
        <div className="section-head">
          <span className="label">DASHBOARD</span>
          <h1 style={{ marginTop: "1rem", fontSize: "clamp(2.25rem, 6vw, 3.5rem)" }}>
            Welcome, <span className="accent-green">{athlete.first_name}.</span>
          </h1>
          <p className="lede" style={{ marginTop: "1rem" }}>
            Profile saved. The rest of your setup — social verification, target
            cities, deal menu, and photo — is coming in the next build.
          </p>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "var(--bg-soft)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
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
              marginBottom: "0.75rem",
            }}
          >
            YOUR PROFILE
          </div>
          <div style={{ fontSize: "0.95rem", color: "var(--text-dim)", lineHeight: 1.7 }}>
            <div>
              <strong style={{ color: "var(--text)" }}>
                {athlete.first_name} {athlete.last_name}
              </strong>
            </div>
            <div>
              {athlete.level} · {athlete.sport}
            </div>
            <div>{athlete.school}</div>
            <div style={{ marginTop: "0.75rem", fontFamily: "var(--mono)", fontSize: "0.78rem", letterSpacing: "0.1em" }}>
              REFERRAL CODE:{" "}
              <span style={{ color: "var(--green)" }}>{athlete.referral_code}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn--ghost">
            Home
          </Link>
          <form action="/auth/signout" method="POST" style={{ display: "inline" }}>
            <button type="submit" className="btn btn--dark">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
