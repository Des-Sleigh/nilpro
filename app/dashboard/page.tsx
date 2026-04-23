import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { ActionBanner } from "@/components/dashboard/ActionBanner";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TargetListSummary } from "@/components/dashboard/TargetListSummary";
import { DealMenuSummary } from "@/components/dashboard/DealMenuSummary";
import { SocialLinkSummary } from "@/components/dashboard/SocialLinkSummary";
import { activeLabel } from "@/lib/time/activeLabel";

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

  // Core athlete profile — if no row, signup isn't finished.
  const { data: athlete } = await supabase
    .from("athletes")
    .select(
      "first_name, last_name, sport, school, level, referral_code, business_categories, created_at, profile_photo_url"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) {
    redirect("/signup/profile");
  }

  // Pull the rest in parallel — none of these block dashboard render;
  // we gracefully degrade if any row is missing.
  const [socialRes, dealMenuRes, targetsRes, citiesRes] = await Promise.all([
    supabase
      .from("social_accounts")
      .select("platform, handle, verified")
      .eq("athlete_id", user.id)
      .maybeSingle(),
    supabase
      .from("deal_menus")
      .select(
        "cash_per_post_enabled, cash_per_post_min, product_trade_enabled, appearance_enabled, appearance_min"
      )
      .eq("athlete_id", user.id)
      .maybeSingle(),
    supabase
      .from("target_lists")
      .select("status, business_id")
      .eq("athlete_id", user.id),
    supabase
      .from("pitch_cities")
      .select("city, state")
      .eq("athlete_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const social = socialRes.data ?? null;
  const dealMenu = dealMenuRes.data ?? null;
  const targets = targetsRes.data ?? [];
  const cities = citiesRes.data ?? [];

  // ---- Target-list counts ------------------------------------------------
  // Only surface approved + pending. Blacklisted / removed are explicitly
  // filtered out of every number we pass to the UI.
  let approvedCount = 0;
  let pendingCount = 0;
  const approvedBusinessIds = new Set<string>();
  for (const row of targets) {
    if (row.status === "approved") {
      approvedCount += 1;
      if (row.business_id) approvedBusinessIds.add(row.business_id as string);
    } else if (row.status === "pending") {
      pendingCount += 1;
    }
  }

  // ---- Derived counts ----------------------------------------------------
  const locationCount = new Set(
    cities.map((c) => `${c.city}|${c.state}`.toLowerCase())
  ).size;
  const categoryCount = Array.isArray(athlete.business_categories)
    ? (athlete.business_categories as string[]).length
    : 0;

  // Phase 1C placeholders — actual pitch/response/deal surfaces land later.
  const pitchesSent = 0;
  const repliesCount = 0;
  const pendingReplies = 0;
  const dealsClosed = 0;
  const isLive = approvedBusinessIds.size > 0;

  const activeLabelText = activeLabel(athlete.created_at as string | null);

  // ---- Action banner: pick the highest-priority missing step ------------
  let missingStep:
    | {
        label: string;
        sub: string;
        href: string;
        cta: string;
      }
    | undefined;

  if (!social) {
    missingStep = {
      label: "Link your Instagram",
      sub: "Businesses need to see you're real before they say yes",
      href: "/signup/verify",
      cta: "Verify now",
    };
  } else if (!dealMenu) {
    missingStep = {
      label: "Finish your deal menu",
      sub: "Tell us what you'll accept so we can pitch it",
      href: "/signup/deal-menu",
      cta: "Build menu",
    };
  } else if (cities.length === 0) {
    missingStep = {
      label: "Add your pitch cities",
      sub: "Pick where you want outreach to run",
      href: "/signup/targets",
      cta: "Add cities",
    };
  } else if (pendingCount > 0 && approvedCount === 0) {
    missingStep = {
      label: `${pendingCount} ${pendingCount === 1 ? "business" : "businesses"} waiting for your approval`,
      sub: "Review your target list — we won't pitch until you say go",
      href: "/signup/review",
      cta: "Review list",
    };
  }

  return (
    <main className="dash-shell">
      <div className="dash-inner">
        <DashboardHero
          firstName={athlete.first_name}
          lastName={athlete.last_name}
          level={athlete.level}
          sport={athlete.sport}
          school={athlete.school}
          profilePhotoUrl={athlete.profile_photo_url as string | null}
        />

        <StatusBar
          approvedCount={approvedBusinessIds.size}
          pitchesSent={pitchesSent}
          repliesCount={repliesCount}
          activeLabel={activeLabelText}
          isLive={isLive}
        />

        <ActionBanner quiet={!missingStep} missingStep={missingStep} />

        <StatsRow
          dealsClosed={dealsClosed}
          pendingReplies={pendingReplies}
          pitchesSent={pitchesSent}
          approvedCount={approvedBusinessIds.size}
        />

        <div className="main-grid">
          <ActivityFeed entries={[]} showEmpty={true} />
          <div>
            <ReferralCard
              referralCode={athlete.referral_code ?? "NILPRO"}
              paidReferrals={0}
            />
            <QuickActions />
          </div>
        </div>

        <div className="dash-snapshot" style={{ marginTop: "1.25rem" }}>
          <TargetListSummary
            approvedCount={approvedBusinessIds.size}
            pendingCount={pendingCount}
            locationCount={locationCount}
            categoryCount={categoryCount}
          />
          <DealMenuSummary
            cashEnabled={Boolean(dealMenu?.cash_per_post_enabled)}
            cashMin={
              typeof dealMenu?.cash_per_post_min === "number"
                ? dealMenu.cash_per_post_min
                : null
            }
            productEnabled={Boolean(dealMenu?.product_trade_enabled)}
            appearanceEnabled={Boolean(dealMenu?.appearance_enabled)}
            appearanceMin={
              typeof dealMenu?.appearance_min === "number"
                ? dealMenu.appearance_min
                : null
            }
          />
          <SocialLinkSummary
            handle={social?.handle ?? null}
            platform={social?.platform ?? null}
            verified={Boolean(social?.verified)}
            pitchCities={cities.map((c) => ({
              city: c.city as string,
              state: c.state as string,
            }))}
          />
        </div>

        <div className="dash-sign-out">
          <form action="/auth/signout" method="POST">
            <button type="submit" className="btn btn--dark btn--sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
