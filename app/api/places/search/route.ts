import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PlacesAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type PlacesDisplayName = {
  text?: string;
};

type PlacesPlace = {
  id?: string;
  displayName?: PlacesDisplayName;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  primaryType?: string;
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  addressComponents?: PlacesAddressComponent[];
};

type PlacesResponse = {
  places?: PlacesPlace[];
  error?: { code?: number; message?: string; status?: string };
};

export type PlacesSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  city: string | null;
  state: string | null;
  primaryType: string | null;
  rating: number | null;
};

// ---- In-memory token bucket, keyed by user id. Best-effort only.
// Request pattern is typing-triggered — 20 reqs / 60s per user is plenty.
const BUCKET_CAPACITY = 20;
const BUCKET_REFILL_PER_SEC = BUCKET_CAPACITY / 60;
type Bucket = { tokens: number; lastRefillAt: number };
const buckets: Map<string, Bucket> = new Map();

function takeToken(userId: string): boolean {
  const now = Date.now();
  const b = buckets.get(userId) ?? {
    tokens: BUCKET_CAPACITY,
    lastRefillAt: now,
  };
  const elapsed = (now - b.lastRefillAt) / 1000;
  b.tokens = Math.min(BUCKET_CAPACITY, b.tokens + elapsed * BUCKET_REFILL_PER_SEC);
  b.lastRefillAt = now;
  if (b.tokens < 1) {
    buckets.set(userId, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(userId, b);
  return true;
}

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

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim();
  const state = (url.searchParams.get("state") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json(
      { error: "query must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (!takeToken(user.id)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("[places/search] GOOGLE_PLACES_API_KEY is not set");
    return NextResponse.json({ results: [] });
  }

  const textQuery =
    city && state ? `${q} in ${city}, ${state}` : q;

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.types",
    "places.primaryType",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.addressComponents",
    "places.rating",
    "places.userRatingCount",
  ].join(",");

  let placesRes: Response;
  try {
    placesRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify({ textQuery, pageSize: 10 }),
        cache: "no-store",
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[places/search] fetch threw for "${textQuery}": ${msg}`);
    return NextResponse.json({ results: [] });
  }

  if (!placesRes.ok) {
    const body = await placesRes.text().catch(() => "");
    console.error(
      `[places/search] upstream ${placesRes.status} for "${textQuery}": ${body}`
    );
    return NextResponse.json({ results: [] });
  }

  const json = (await placesRes.json()) as PlacesResponse;
  if (json.error) {
    console.error("[places/search] API error:", json.error);
    return NextResponse.json({ results: [] });
  }

  const results: PlacesSearchResult[] = (json.places ?? [])
    .slice(0, 10)
    .map((p) => {
      if (!p.id) return null;
      const parsedCity =
        extractAddressPart(p.addressComponents, [
          "locality",
          "postal_town",
          "sublocality",
          "administrative_area_level_3",
        ]) ?? null;
      const parsedState =
        extractAddressPart(p.addressComponents, [
          "administrative_area_level_1",
        ]) ?? null;
      return {
        placeId: p.id,
        name: p.displayName?.text ?? "Unknown",
        formattedAddress: p.formattedAddress ?? null,
        city: parsedCity,
        state: parsedState,
        primaryType: p.primaryType ?? null,
        rating: typeof p.rating === "number" ? p.rating : null,
      };
    })
    .filter((x): x is PlacesSearchResult => x !== null);

  return NextResponse.json({ results });
}
