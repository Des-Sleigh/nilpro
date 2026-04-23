import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — NILPro",
};

type TargetStatusCounts = {
  approved: number;
  pending: number;
  removed: number;
  blacklisted: number;
  total: number;
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

  const { data: social } = await supabase
    .from("social_accounts")
    .select("platform, handle, verified, verified_at")
    .eq("athlete_id", user.id)
    .maybeSingle();

  const { data: targetRows } = await supabase
    .from("target_lists")
    .select("status")
    .eq("athlete_id", user.id);

  const counts: TargetStatusCounts = {
    approved: 0,
    pending: 0,
    removed: 0,
    blacklisted: 0,
    total: 0,
  };
  for (const row of targetRows ?? []) {
    counts.total += 1;
    if (row.status === "approved") counts.approved += 1;
    else if (row.status === "pending") counts.pending += 1;
    else if (row.status === "removed") counts.removed += 1;
    else if (row.status === "blacklisted") counts.blacklisted += 1;
  }

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "44rem" }}>
        <div className="section-head">
          <span className="label">DASHBOARD</span>
          <h1 style={{ marginTop: "1rem", fontSize: "clamp(2.25rem, 6vw, 3.5rem)" }}>
            Welcome, <span className="accent-green">{athlete.first_name}.</span>
          </h1>
          <p className="lede" style={{ marginTop: "1rem" }}>
            Your profile, verification, target list, and deal menu are set.
            We&apos;ll email you the moment outreach starts moving.
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

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            background: "var(--bg-soft)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
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
              }}
            >
              YOUR TARGET LIST
            </div>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
              }}
            >
              Management coming soon
            </span>
          </div>

          {counts.total === 0 ? (
            <p
              style={{
                margin: 0,
                color: "var(--text-dim)",
                fontSize: "0.92rem",
                lineHeight: 1.6,
              }}
            >
              You haven&apos;t built a target list yet.{" "}
              <Link href="/signup/targets" className="accent-green">
                Add your cities and categories →
              </Link>
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
                gap: "0.75rem",
              }}
            >
              <StatTile label="Approved" value={counts.approved} tone="green" />
              <StatTile label="Pending" value={counts.pending} tone="gold" />
              <StatTile label="Removed" value={counts.removed} tone="muted" />
              <StatTile label="Blacklisted" value={counts.blacklisted} tone="red" />
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "1.5rem",
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
            SOCIAL VERIFICATION
          </div>
          {social ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text)", fontFamily: "var(--mono)" }}>
                  @{social.handle}
                </span>{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  ({social.platform === "instagram" ? "Instagram" : "TikTok"})
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: social.verified ? "var(--green)" : "var(--gold)",
                }}
              >
                ● {social.verified ? "Verified" : "Pending verification"}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--text-dim)", fontSize: "0.92rem" }}>
              You haven&apos;t linked a social account yet.{" "}
              <Link href="/signup/verify" className="accent-green">
                Verify your handle →
              </Link>
            </p>
          )}
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

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "gold" | "red" | "muted";
}) {
  const color =
    tone === "green"
      ? "var(--green)"
      : tone === "gold"
      ? "var(--gold)"
      : tone === "red"
      ? "var(--red)"
      : "var(--text-muted)";

  return (
    <div
      style={{
        padding: "0.85rem 1rem",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: "2rem",
          color,
          marginTop: "0.2rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
