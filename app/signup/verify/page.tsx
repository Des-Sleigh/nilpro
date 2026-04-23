import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import { VerifyForm } from "@/components/auth/VerifyForm";
import { confirmDmSentAction } from "./actions";

export const metadata: Metadata = {
  title: "Verify your account — NILPro",
};

type SearchParams = {
  error?: string;
  sent?: string;
  platform?: string;
  handle?: string;
  code?: string;
};

export default async function VerifyStep({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup/create");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  // If a social_accounts row already exists for this athlete, they've been
  // through this step. Skip to /signup/targets whether or not they're
  // verified yet (verification is manual and async — we don't block).
  const { data: social } = await supabase
    .from("social_accounts")
    .select("id, platform, handle, verification_code, verified")
    .eq("athlete_id", user.id)
    .maybeSingle();

  const params = await searchParams;

  // If they already have a social row AND this page wasn't just hit by the
  // "sent=1" redirect from startVerificationAction, skip to deal-menu
  // (deal-menu is now the next step after verify).
  if (social && params.sent !== "1") {
    redirect("/signup/deal-menu");
  }

  const sent = params.sent === "1";
  const handleFromQuery = params.handle ?? social?.handle ?? "";
  const platformFromQuery = (params.platform ?? social?.platform ?? "instagram") as
    | "instagram"
    | "tiktok";
  const codeFromQuery = params.code ?? social?.verification_code ?? "";

  return (
    <SignupShell
      step={3}
      eyebrow="VERIFY YOU'RE YOU"
      title={
        <>
          Prove it&apos;s <span className="accent-green">you.</span>
        </>
      }
    >
      {!sent ? (
        <>
          <p className="lede" style={{ marginTop: "0.25rem" }}>
            We verify every athlete before contacting businesses on your behalf.
            Gives local businesses confidence they&apos;re talking to the real
            you.
          </p>
          <VerifyForm error={params.error} />
        </>
      ) : (
        <DmInstructions
          platform={platformFromQuery}
          handle={handleFromQuery}
          code={codeFromQuery}
        />
      )}
    </SignupShell>
  );
}

function DmInstructions({
  platform,
  handle,
  code,
}: {
  platform: "instagram" | "tiktok";
  handle: string;
  code: string;
}) {
  const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}
    >
      <div
        style={{
          padding: "1.25rem",
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
          ● YOUR VERIFICATION CODE
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "2rem",
            letterSpacing: "0.25em",
            color: "var(--text)",
            fontWeight: 700,
            textAlign: "center",
            padding: "0.5rem 0",
          }}
        >
          {code}
        </div>
      </div>

      <div
        style={{
          padding: "1.25rem",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--cond)",
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "var(--text)",
            marginBottom: "0.85rem",
          }}
        >
          How to finish verifying
        </div>
        <ol
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          <InstructionStep num="01">
            Open <strong style={{ color: "var(--text)" }}>{platformLabel}</strong> on
            the phone logged in to{" "}
            <strong style={{ color: "var(--green)" }}>@{handle}</strong>
          </InstructionStep>
          <InstructionStep num="02">
            DM <strong style={{ color: "var(--text)" }}>@nilpro</strong> with the
            code above
          </InstructionStep>
          <InstructionStep num="03">
            We confirm your DM within 24 hours — you&apos;ll get an email when
            verified
          </InstructionStep>
        </ol>
      </div>

      <div
        style={{
          padding: "1rem 1.15rem",
          border: "1px solid var(--gold)",
          background: "rgba(255, 184, 0, 0.08)",
          borderRadius: "var(--r-sm)",
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
          ⚑ KEEP GOING
        </div>
        <div style={{ fontSize: "0.87rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
          You can continue setup in the meantime. Outreach just won&apos;t
          start until we verify your DM.
        </div>
      </div>

      <form action={confirmDmSentAction}>
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          style={{ width: "100%", justifyContent: "center" }}
        >
          I&apos;ve sent the DM — continue →
        </button>
      </form>
    </div>
  );
}

function InstructionStep({
  num,
  children,
}: {
  num: string;
  children: React.ReactNode;
}) {
  return (
    <li style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem" }}>
      <strong
        style={{
          color: "var(--green)",
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          minWidth: "1.5rem",
        }}
      >
        {num}
      </strong>
      <span style={{ color: "var(--text-dim)", lineHeight: 1.5 }}>
        {children}
      </span>
    </li>
  );
}
