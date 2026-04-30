"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/settings/deal-menu?error=${encodeURIComponent(msg)}`);
}

/** Generic error redirect for DB failures. Logs the underlying error
 *  server-side (Sentry/Vercel logs pick it up) and shows the user a
 *  generic message — never leaks PG error text / column names / SQL
 *  fragments via the URL. Audit Cat 5 (low). */
function dbFail(err: { message?: string } | null, where: string): never {
  if (err) console.error(`[deal-menu/${where}] db error:`, err.message);
  fail("Couldn't save — try again.");
}

function parseIntOrNull(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[^0-9]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > 100000) return 100000;
  return n;
}

export async function saveDealMenuSettingsAction(formData: FormData) {
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

  const cashEnabled = formData.get("cash_per_post_enabled") === "on";
  const cashMin = parseIntOrNull(
    String(formData.get("cash_per_post_min") ?? "")
  );
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

  const payload = {
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
    .update(payload)
    .eq("athlete_id", user.id);
  if (error) dbFail(error, "save");

  revalidatePath("/settings/deal-menu");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
