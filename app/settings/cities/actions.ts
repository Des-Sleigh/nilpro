"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runPlacesSearchForAthlete } from "@/lib/places/search";
import { CATEGORIES } from "@/lib/places/categories";

const VALID_RADII = [5, 10, 25, 50] as const;
type Radius = (typeof VALID_RADII)[number];

function fail(msg: string): never {
  redirect(`/settings/cities?error=${encodeURIComponent(msg)}`);
}

/** Generic error redirect for DB failures. Logs underlying PG error
 *  server-side and surfaces a generic message to the user. Audit Cat 5. */
function dbFail(err: { message?: string } | null, where: string): never {
  if (err) console.error(`[cities/${where}] db error:`, err.message);
  fail("Couldn't save — try again.");
}

/** Cap string to maxLen characters and strip control chars. Audit Cat 5
 *  (input length caps). */
function cap(raw: string | null | undefined, maxLen: number): string {
  if (!raw) return "";
  const cleaned = String(raw).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

export async function saveCitiesSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/settings/cities");

  const { data: athlete } = await supabase
    .from("athletes")
    .select(
      "id, hometown_city, hometown_state, business_categories"
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!athlete) redirect("/signup/profile");

  // ---- Cities ---------------------------------------------------------
  const cityValues = formData.getAll("city").map((v) => cap(String(v).trim(), 80));
  const stateValues = formData.getAll("state").map((v) => cap(String(v).trim(), 2));

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

  // ---- Radius ---------------------------------------------------------
  const radiusRaw = Number(formData.get("radius"));
  const radius = (VALID_RADII as readonly number[]).includes(radiusRaw)
    ? (radiusRaw as Radius)
    : 10;

  // ---- Categories ------------------------------------------------------
  const categoryValues = formData
    .getAll("category")
    .map((v) => String(v))
    .filter((v) => v.length > 0);
  const validKeys = new Set(CATEGORIES.map((c) => c.id));
  const categories = Array.from(new Set(categoryValues)).filter((c) =>
    validKeys.has(c)
  );
  if (categories.length === 0) fail("Pick at least one business category.");

  // ---- Existing state for delta ---------------------------------------
  const { data: existingCitiesRows } = await supabase
    .from("pitch_cities")
    .select("city, state")
    .eq("athlete_id", user.id);

  const existingCityKeys = new Set(
    (existingCitiesRows ?? []).map(
      (r) => `${(r.city as string).toLowerCase()}|${(r.state as string).toUpperCase()}`
    )
  );
  const existingCategories = new Set(
    (athlete.business_categories as string[] | null) ?? []
  );

  // ---- Persist pitch_cities (wipe + reinsert) -------------------------
  const { error: delErr } = await supabase
    .from("pitch_cities")
    .delete()
    .eq("athlete_id", user.id);
  if (delErr) dbFail(delErr, "deleteCities");

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

  const { error: insErr } = await supabase
    .from("pitch_cities")
    .insert(pitchRows);
  if (insErr) dbFail(insErr, "insertCities");

  // ---- Persist athlete.business_categories ----------------------------
  const { error: updErr } = await supabase
    .from("athletes")
    .update({
      business_categories: categories,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updErr) dbFail(updErr, "updateCategories");

  // ---- Compute deltas for Places search -------------------------------
  // Only run Places for NEW (city,state × category) pairs so we don't
  // thrash the cache for combos we already have.
  const newCities = cities.filter(
    (c) =>
      !existingCityKeys.has(
        `${c.city.toLowerCase()}|${c.state.toUpperCase()}`
      )
  );
  const newCategories = categories.filter((c) => !existingCategories.has(c));

  const searchTasks: Promise<unknown>[] = [];

  // New cities × all categories
  if (newCities.length > 0 && categories.length > 0) {
    searchTasks.push(
      runPlacesSearchForAthlete({
        athleteId: user.id,
        cities: newCities,
        categories,
        radiusMiles: radius,
      })
    );
  }

  // Existing cities × new categories
  const existingCityList = cities.filter((c) =>
    existingCityKeys.has(`${c.city.toLowerCase()}|${c.state.toUpperCase()}`)
  );
  if (existingCityList.length > 0 && newCategories.length > 0) {
    searchTasks.push(
      runPlacesSearchForAthlete({
        athleteId: user.id,
        cities: existingCityList,
        categories: newCategories,
        radiusMiles: radius,
      })
    );
  }

  if (searchTasks.length > 0) {
    try {
      await Promise.all(searchTasks);
    } catch (err) {
      console.error("[settings/cities] places search threw:", err);
    }
  }

  revalidatePath("/target-list");
  revalidatePath("/dashboard");
  redirect("/target-list");
}
