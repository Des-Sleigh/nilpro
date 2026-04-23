// NOTE: This module is server-only. It imports the admin Supabase client
// (service_role key) and calls the Google Places API. Never import it from
// a Client Component. We'd prefer `import "server-only";` but that package
// isn't a direct dep, and createAdminClient() already throws in the browser
// because SUPABASE_SERVICE_ROLE_KEY is unavailable there.

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Google Places (New) integration used during /signup/targets.
 *
 * For each (city, category) combo the athlete selected, we:
 *  1. Check the `places_queries` cache — skip if fetched within 30 days.
 *  2. Otherwise hit https://places.googleapis.com/v1/places:searchText
 *     with a text query like "restaurants in Waco, TX".
 *  3. Upsert each returned place into `businesses`.
 *  4. Insert target_lists rows (athlete_id, business_id) with status='pending'.
 *  5. Skip businesses marked global_blacklisted.
 *
 * Design notes:
 *  - We don't have reliable city-center lat/lng on hand during signup, so
 *    we skip `locationBias` and trust the text query's implicit geo. A later
 *    enhancement: geocode the city once, cache it, and pass a circle bias
 *    with the athlete's chosen radius.
 *  - "retail" is intentionally lossy — Places doesn't have a direct match,
 *    so "local retail" surfaces boutiques, sporting-goods, and specialty stores
 *    along with some noise. Acceptable for Phase 1.
 *  - All writes use the service_role admin client because RLS blocks anon
 *    inserts into `businesses` and `places_queries`.
 *  - Throws are swallowed at the top level — the athlete should never be
 *    blocked from continuing by an upstream Places hiccup.
 */

const CACHE_DAYS = 30;

// Map our internal category id -> Google text-search term.
export const CATEGORY_QUERIES: Record<string, string> = {
  restaurants: "restaurants",
  fitness: "gym",
  beauty: "hair salon",
  retail: "local retail",
  coffee: "coffee shop",
  auto: "auto shop",
  // "other" is skipped on purpose — no sensible default query.
};

// Re-exported for convenience for server callers; client code should import
// directly from "@/lib/places/categories".
export { CATEGORY_LABELS } from "@/lib/places/categories";

export type CityInput = {
  city: string;
  state: string;
};

export type SearchInput = {
  athleteId: string;
  cities: CityInput[];
  categories: string[];
  radiusMiles: number;
};

type PlacesAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type PlacesLocation = {
  latitude?: number;
  longitude?: number;
};

type PlacesDisplayName = {
  text?: string;
  languageCode?: string;
};

type PlacesPlace = {
  id?: string;
  displayName?: PlacesDisplayName;
  formattedAddress?: string;
  location?: PlacesLocation;
  types?: string[];
  primaryType?: string;
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  addressComponents?: PlacesAddressComponent[];
};

type PlacesResponse = {
  places?: PlacesPlace[];
  error?: { code?: number; message?: string; status?: string };
};

type BusinessRow = {
  id: string;
};

function extractAddressPart(
  components: PlacesAddressComponent[] | undefined,
  types: string[]
): string | null {
  if (!components) return null;
  for (const comp of components) {
    if (!comp.types) continue;
    for (const t of types) {
      if (comp.types.includes(t)) {
        return comp.shortText ?? comp.longText ?? null;
      }
    }
  }
  return null;
}

async function googleTextSearch(
  textQuery: string,
  apiKey: string
): Promise<PlacesPlace[]> {
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.types",
    "places.primaryType",
    "places.rating",
    "places.userRatingCount",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.addressComponents",
  ].join(",");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({ textQuery }),
    // Google Places is fairly fast but never bulletproof — 15s ceiling.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `[places] searchText failed (${res.status}) for "${textQuery}": ${text}`
    );
    return [];
  }

  const json = (await res.json()) as PlacesResponse;
  if (json.error) {
    console.error(`[places] API error for "${textQuery}":`, json.error);
    return [];
  }
  return json.places ?? [];
}

/**
 * Run the full search + upsert for one athlete. Safe to re-run — we use
 * ON CONFLICT DO NOTHING on target_lists (athlete_id, business_id).
 *
 * Returns the number of new target_lists rows we inserted.
 */
export async function runPlacesSearchForAthlete(
  input: SearchInput
): Promise<{ inserted: number; skipped: boolean; errors: string[] }> {
  const errors: string[] = [];
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn(
      "[places] GOOGLE_PLACES_API_KEY is not set — skipping Places search."
    );
    return { inserted: 0, skipped: true, errors: ["missing-api-key"] };
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - CACHE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  let totalInserted = 0;

  for (const city of input.cities) {
    for (const category of input.categories) {
      const queryTerm = CATEGORY_QUERIES[category];
      if (!queryTerm) continue; // "other" and unknown keys — skip.

      // Cache check.
      const { data: cached } = await admin
        .from("places_queries")
        .select("id, last_fetched_at, result_count")
        .eq("city", city.city)
        .eq("state", city.state)
        .eq("category", category)
        .eq("radius_miles", input.radiusMiles)
        .maybeSingle();

      let places: PlacesPlace[] = [];
      const isFresh =
        cached?.last_fetched_at &&
        new Date(cached.last_fetched_at).toISOString() > cutoff;

      if (isFresh) {
        // Cache hit — we still need the businesses to hook up target_lists
        // for THIS athlete, so pull from our businesses table by the
        // search-term category.
        const { data: existingBusinesses, error: fetchErr } = await admin
          .from("businesses")
          .select("id, city, state, global_blacklisted, primary_category")
          .eq("city", city.city)
          .eq("state", city.state)
          .eq("primary_category", category);

        if (fetchErr) {
          errors.push(`cache-read-${city.city}-${category}: ${fetchErr.message}`);
          continue;
        }

        for (const b of existingBusinesses ?? []) {
          if (b.global_blacklisted) continue;
          const { error: insErr } = await admin.from("target_lists").insert({
            athlete_id: input.athleteId,
            business_id: b.id,
            status: "pending",
            source_category: category,
            source_city: city.city,
          });
          // 23505 = unique violation (already targeted). Ignore.
          if (insErr && insErr.code !== "23505") {
            errors.push(
              `tl-insert-${b.id}: ${insErr.code ?? ""} ${insErr.message}`
            );
          } else if (!insErr) {
            totalInserted += 1;
          }
        }
        continue;
      }

      // Cache miss — hit Google.
      const textQuery = `${queryTerm} in ${city.city}, ${city.state}`;
      try {
        places = await googleTextSearch(textQuery, apiKey);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[places] fetch threw for "${textQuery}":`, msg);
        errors.push(`fetch-${city.city}-${category}: ${msg}`);
        places = [];
      }

      // Upsert the places_queries row regardless (so we don't hammer
      // Google on every retry when the query returns zero).
      await admin
        .from("places_queries")
        .upsert(
          {
            city: city.city,
            state: city.state,
            category,
            radius_miles: input.radiusMiles,
            last_fetched_at: new Date().toISOString(),
            result_count: places.length,
          },
          { onConflict: "city,state,category,radius_miles" }
        );

      for (const place of places) {
        if (!place.id) continue;

        const parsedCity =
          extractAddressPart(place.addressComponents, [
            "locality",
            "postal_town",
            "sublocality",
            "administrative_area_level_3",
          ]) ?? city.city;
        const parsedState =
          extractAddressPart(place.addressComponents, [
            "administrative_area_level_1",
          ]) ?? city.state;
        const parsedPostal = extractAddressPart(place.addressComponents, [
          "postal_code",
        ]);

        const businessPayload = {
          google_place_id: place.id,
          name: place.displayName?.text ?? "Unknown",
          formatted_address: place.formattedAddress ?? null,
          city: parsedCity,
          state: parsedState,
          postal_code: parsedPostal,
          latitude: place.location?.latitude ?? null,
          longitude: place.location?.longitude ?? null,
          phone:
            place.nationalPhoneNumber ??
            place.internationalPhoneNumber ??
            null,
          website: place.websiteUri ?? null,
          primary_category: category,
          google_types: place.types ?? null,
          google_rating: place.rating ?? null,
          google_user_ratings_total: place.userRatingCount ?? null,
          last_google_sync_at: new Date().toISOString(),
        };

        const { data: upserted, error: upsertErr } = await admin
          .from("businesses")
          .upsert(businessPayload, { onConflict: "google_place_id" })
          .select("id, global_blacklisted")
          .maybeSingle();

        if (upsertErr || !upserted) {
          errors.push(
            `biz-upsert-${place.id}: ${upsertErr?.code ?? ""} ${
              upsertErr?.message ?? "no-row"
            }`
          );
          continue;
        }

        if (upserted.global_blacklisted) continue;

        const { error: tlErr } = await admin.from("target_lists").insert({
          athlete_id: input.athleteId,
          business_id: (upserted as BusinessRow).id,
          status: "pending",
          source_category: category,
          source_city: city.city,
        });

        if (tlErr && tlErr.code !== "23505") {
          errors.push(
            `tl-insert-${upserted.id}: ${tlErr.code ?? ""} ${tlErr.message}`
          );
        } else if (!tlErr) {
          totalInserted += 1;
        }
      }
    }
  }

  return { inserted: totalInserted, skipped: false, errors };
}
