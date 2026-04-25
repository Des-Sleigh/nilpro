"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/signup/deal-menu?error=${encodeURIComponent(msg)}`);
}

function parseIntOrNull(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[^0-9]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > 100000) return 100000;
  return n;
}

export async function saveDealMenuAction(formData: FormData) {
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

  const cashEnabled = formData.get("cash_per_post_enabled") === "on";
  const cashMin = parseIntOrNull(String(formData.get("cash_per_post_min") ?? ""));
  const gearEnabled = formData.get("gear_enabled") === "on";
  const productEnabled = formData.get("product_trade_enabled") === "on";
  const appearanceEnabled = formData.get("appearance_enabled") === "on";
  const appearanceMin = parseIntOrNull(
    String(formData.get("appearance_min") ?? "")
  );

  if (!cashEnabled && !gearEnabled && !productEnabled && !appearanceEnabled) {
    fail("Pick at least one deal type.");
  }

  if (cashEnabled && (cashMin === null || cashMin <= 0)) {
    fail("Enter a minimum dollar amount for cash per post.");
  }

  if (appearanceEnabled && (appearanceMin === null || appearanceMin <= 0)) {
    fail("Enter a minimum dollar amount for appearances.");
  }

  // Note: `mutual_promo_enabled` column still exists in the DB from 0001 —
  // we simply don't touch it here. Harmless to leave dormant.
  const payload = {
    athlete_id: user.id,
    cash_per_post_enabled: cashEnabled,
    cash_per_post_min: cashEnabled ? cashMin : null,
    gear_enabled: gearEnabled,
    product_trade_enabled: productEnabled,
    appearance_enabled: appearanceEnabled,
    appearance_min: appearanceEnabled ? appearanceMin : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("deal_menus")
    .upsert(payload, { onConflict: "athlete_id" });
  if (error) fail(error.message);

  // Next step in the new flow is locations & categories (targets).
  revalidatePath("/signup/targets");
  redirect("/signup/targets");
}
