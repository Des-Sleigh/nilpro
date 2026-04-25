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

  // New order: deal-menu comes AFTER verify, BEFORE targets.
  // Require a social_accounts row; if deal_menus already saved, jump to
  // targets (the next step in the new flow).
  const { data: social } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();
  if (!social) redirect("/signup/verify");

  const { data: existing } = await supabase
    .from("deal_menus")
    .select(
      "cash_per_post_enabled, cash_per_post_min, gear_enabled, product_trade_enabled, appearance_enabled, appearance_min"
    )
    .eq("athlete_id", user.id)
    .maybeSingle();

  if (existing) redirect("/signup/targets");

  const defaults = {
    cashEnabled: false,
    cashMin: null,
    gearEnabled: false,
    productEnabled: false,
    appearanceEnabled: false,
    appearanceMin: null,
  };

  const params = await searchParams;

  return (
    <SignupShell
      step={4}
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
