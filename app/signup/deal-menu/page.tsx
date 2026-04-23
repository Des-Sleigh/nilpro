import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import { DealMenuForm } from "@/components/auth/DealMenuForm";

export const metadata: Metadata = {
  title: "Deal menu — NILPro",
};

export default async function DealMenuStep({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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

  const { data: social } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();
  if (!social) redirect("/signup/verify");

  const { data: cities } = await supabase
    .from("pitch_cities")
    .select("id")
    .eq("athlete_id", user.id)
    .limit(1);
  if (!cities || cities.length === 0) redirect("/signup/targets");

  // If deal_menus already saved, jump to dashboard.
  const { data: existing } = await supabase
    .from("deal_menus")
    .select(
      "cash_per_post_enabled, cash_per_post_min, product_trade_enabled, appearance_enabled, appearance_min, mutual_promo_enabled"
    )
    .eq("athlete_id", user.id)
    .maybeSingle();

  if (existing) redirect("/dashboard");

  const defaults = {
    cashEnabled: false,
    cashMin: null,
    productEnabled: false,
    appearanceEnabled: false,
    appearanceMin: null,
    mutualEnabled: false,
  };

  const params = await searchParams;

  return (
    <SignupShell
      step={6}
      eyebrow="YOUR DEAL MENU"
      title={
        <>
          Build your <span className="accent-green">deal menu.</span>
        </>
      }
    >
      <p className="lede" style={{ marginTop: "0.25rem" }}>
        Check what you&apos;ll accept and set your minimums. Businesses can say
        yes — or counter with different terms, which lands in your dashboard.
      </p>
      <DealMenuForm defaults={defaults} error={params.error} />
    </SignupShell>
  );
}
