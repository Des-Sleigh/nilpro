"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runPlacesSearchForAthlete } from "@/lib/places/search";
import { CATEGORIES } from "@/lib/places/categories";

const VALID_RADII = [5, 10, 25, 50] as const;
type Radius = (typeof VALID_RADII)[number];

function fail(msg: string): never {
  redirect(`/signup/targets?error=${encodeURIComponent(msg)}`);
}

export async function saveTargetsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, hometown_city, hometown_state")
    .eq("id", user.id)
    .maybeSingle();
  if (!athlete) redirect("/signup/profile");

  // ---- Cities -----------------------------------------------------------
  // Form sends parallel arrays: city[], state[]. Next's FormData.getAll
  // preserves order.
  const cityValues = formData.getAll("city").map((v) => String(v).trim());
  const stateValues = formData.getAll("state").map((v) => String(v).trim());

  if (cityValues.length === 0 || cityValues.length !== stateValues.length) {
    fail("Add at least one location.");
  }

  const cities: { city: string; state: string }[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < cityValues.length; i++) {
    const city = cityValues[i];
    const state = stateValues[i].toUpperCase();
    if (!city || !state) continue;
    const key = `${city.toLowerCase()}|${state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cities.push({ city, state });
  }
  if (cities.length === 0) fail("Add at least one location.");

  // ---- Radius -----------------------------------------------------------
  const radiusRaw = Number(formData.get("radius"));
  const radius = (VALID_RADII as readonly number[]).includes(radiusRaw)
    ? (radiusRaw as Radius)
    : 10;

  // ---- Categories -------------------------------------------------------
  const categoryValues = formData
    .getAll("category")
    .map((v) => String(v))
    .filter((v) => v.length > 0);
  const validKeys = new Set(CATEGORIES.map((c) => c.id));
  const categories = Array.from(new Set(categoryValues)).filter((c) =>
    validKeys.has(c)
  );
  if (categories.length === 0) fail("Pick at least one business category.");

  // ---- Persist ---------------------------------------------------------
  // Wipe existing pitch_cities for this athlete (so editing is idempotent).
  const { error: delErr } = await supabase
    .from("pitch_cities")
    .delete()
    .eq("athlete_id", user.id);
  if (delErr) fail(delErr.message);

  const pitchRows = cities.map(({ city, state }) => {
    const isHometown =
      athlete.hometown_city &&
      athlete.hometown_state &&
      city.toLowerCase() === athlete.hometown_city.toLowerCase() &&
      state === athlete.hometown_state.toUpperCase();
    return {
      athlete_id: user.id,
      city,
      state,
      radius_miles: radius,
      is_hometown: Boolean(isHometown),
      is_school_city: false,
    };
  });

  const { error: insErr } = await supabase.from("pitch_cities").insert(pitchRows);
  if (insErr) fail(insErr.message);

  const { error: updErr } = await supabase
    .from("athletes")
    .update({ business_categories: categories, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updErr) fail(updErr.message);

  // ---- Places search (synchronous, admin-client) ------------------------
  // Wipe any prior pending rows so re-submitting gives a clean review list.
  // Leave 'approved', 'removed', 'blacklisted' intact — those are athlete
  // decisions we shouldn't stomp on.
  const admin = createAdminClient();
  await admin
    .from("target_lists")
    .delete()
    .eq("athlete_id", user.id)
    .eq("status", "pending");

  try {
    const result = await runPlacesSearchForAthlete({
      athleteId: user.id,
      cities,
      categories,
      radiusMiles: radius,
    });
    if (result.errors.length > 0) {
      console.warn("[targets] places search partial errors:", result.errors);
    }
  } catch (err) {
    // Never block the athlete on a Places failure — they can still review
    // an empty list and add cities / manual businesses later.
    console.error("[targets] places search threw:", err);
  }

  revalidatePath("/signup/review");
  redirect("/signup/review");
}
