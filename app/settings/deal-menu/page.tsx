import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DealMenuForm } from "@/components/auth/DealMenuForm";
import { saveDealMenuSettingsAction } from "./actions";

export const metadata: Metadata = {
  title: "Edit deal menu — NILPro",
};

export default async function SettingsDealMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/settings/deal-menu");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  const { data: existing } = await supabase
    .from("deal_menus")
    .select(
      "cash_per_post_enabled, cash_per_post_min, gear_enabled, product_trade_enabled, appearance_enabled, appearance_min"
    )
    .eq("athlete_id", user.id)
    .maybeSingle();

  if (!existing) redirect("/signup/deal-menu");

  const defaults = {
    cashEnabled: Boolean(existing.cash_per_post_enabled),
    cashMin:
      typeof existing.cash_per_post_min === "number"
        ? existing.cash_per_post_min
        : null,
    gearEnabled: Boolean(existing.gear_enabled),
    productEnabled: Boolean(existing.product_trade_enabled),
    appearanceEnabled: Boolean(existing.appearance_enabled),
    appearanceMin:
      typeof existing.appearance_min === "number"
        ? existing.appearance_min
        : null,
  };

  const params = await searchParams;

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "34rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            ← Back to dashboard
          </Link>
        </div>
        <div className="section-head" style={{ marginBottom: "2rem" }}>
          <span className="label">DEAL MENU</span>
          <h1 style={{ marginTop: "1rem" }}>
            Edit your <span className="accent-green">deal menu.</span>
          </h1>
          <p className="lede" style={{ marginTop: "0.75rem" }}>
            Turn deal types on or off and adjust minimums. Changes go live
            immediately for new outreach.
          </p>
        </div>
        <DealMenuForm
          defaults={defaults}
          error={params.error}
          action={saveDealMenuSettingsAction}
          submitLabel="Save changes →"
        />
      </div>
    </main>
  );
}
