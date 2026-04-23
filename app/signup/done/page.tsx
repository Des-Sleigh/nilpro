import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";

export const metadata: Metadata = {
  title: "You're in — NILPro",
};

export default async function DoneStep() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("first_name, last_name, profile_photo_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!athlete) redirect("/signup/profile");

  // Guard: approved target list required. If nothing's approved they
  // haven't actually finished review.
  const { data: approved } = await supabase
    .from("target_lists")
    .select("id")
    .eq("athlete_id", user.id)
    .eq("status", "approved");

  if (!approved || approved.length === 0) {
    redirect("/signup/review");
  }

  const [social, dealMenu] = await Promise.all([
    supabase
      .from("social_accounts")
      .select("platform, handle, verified")
      .eq("athlete_id", user.id)
      .order("platform", { ascending: true }),
    supabase
      .from("deal_menus")
      .select("cash_per_post_enabled, product_trade_enabled, appearance_enabled")
      .eq("athlete_id", user.id)
      .maybeSingle(),
  ]);

  const socials = social.data ?? [];
  const ig = socials.find((s) => s.platform === "instagram") ?? null;
  const tiktok = socials.find((s) => s.platform === "tiktok") ?? null;
  const dm = dealMenu.data;
  const dealCount =
    Number(Boolean(dm?.cash_per_post_enabled)) +
    Number(Boolean(dm?.product_trade_enabled)) +
    Number(Boolean(dm?.appearance_enabled));

  const hasPhoto = Boolean(athlete.profile_photo_url);

  return (
    <SignupShell
      step={8}
      eyebrow="YOU'RE IN"
      title={
        <>
          You&apos;re <span className="accent-green">in.</span>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          marginTop: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.1rem 1.15rem",
            border: "1px solid var(--green)",
            background: "var(--green-dim)",
            borderRadius: "var(--r-md)",
          }}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={athlete.profile_photo_url ?? ""}
              alt=""
              style={{
                width: "3.25rem",
                height: "3.25rem",
                objectFit: "cover",
                borderRadius: "9999px",
                border: "2px solid var(--green)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "3.25rem",
                height: "3.25rem",
                borderRadius: "9999px",
                background: "var(--bg)",
                border: "2px solid var(--green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--cond)",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--green)",
                flexShrink: 0,
              }}
            >
              {athlete.first_name[0]}
              {athlete.last_name[0]}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
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
              ● Welcome aboard
            </div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--text)",
                marginTop: "0.15rem",
                lineHeight: 1.1,
              }}
            >
              {athlete.first_name} {athlete.last_name}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-soft)",
            borderRadius: "var(--r-md)",
            padding: "1.15rem 1.15rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            Your setup
          </div>
          <SummaryRow
            label="Instagram"
            value={
              ig
                ? `@${ig.handle} · ${ig.verified ? "verified" : "pending"}`
                : "Not linked"
            }
          />
          <SummaryRow
            label="TikTok"
            value={tiktok ? `@${tiktok.handle}` : "—"}
          />
          <SummaryRow
            label="Approved businesses"
            value={`${approved.length} on your list`}
          />
          <SummaryRow
            label="Deal menu"
            value={
              dealCount > 0
                ? `${dealCount} of 3 deal types on`
                : "Not set"
            }
          />
          <SummaryRow
            label="Profile photo"
            value={hasPhoto ? "Uploaded" : "Skipped"}
          />
        </div>

        <div
          style={{
            padding: "1rem 1.15rem",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 700,
              marginBottom: "0.4rem",
            }}
          >
            ⚑ WHAT&apos;S NEXT
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--text-dim)",
              lineHeight: 1.55,
            }}
          >
            We&apos;ll kick off outreach once Instagram verification lands.
            You&apos;ll see pitches, replies, and deal counters in your dashboard
            — and you approve every one before anything goes live.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            marginTop: "0.25rem",
          }}
        >
          <Link
            href="/dashboard"
            className="btn btn--primary btn--lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Go to dashboard →
          </Link>
          <Link
            href="/dashboard#referrals"
            className="btn btn--ghost btn--lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Get my referral link
          </Link>
        </div>
      </div>
    </SignupShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "1rem",
        padding: "0.4rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--cond)",
          fontSize: "0.95rem",
          color: "var(--text)",
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
