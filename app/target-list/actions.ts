"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES, categoryFromPlaceType } from "@/lib/places/categories";

function normalizeTerm(raw: string): string {
  return raw.trim().toLowerCase();
}

function dedupe(terms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of terms) {
    const n = normalizeTerm(t);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function fail(msg: string): never {
  redirect(`/target-list?error=${encodeURIComponent(msg)}`);
}

/** Generic error redirect for DB failures. Logs underlying PG error
 *  server-side and surfaces a generic message to the user. Audit Cat 5. */
function dbFail(err: { message?: string } | null, where: string): never {
  if (err) console.error(`[target-list/${where}] db error:`, err.message);
  fail("Couldn't save — try again.");
}

/** Cap string to maxLen characters and strip control chars. Audit Cat 5
 *  (input length caps). */
function cap(raw: string | null | undefined, maxLen: number): string {
  if (!raw) return "";
  const cleaned = String(raw).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

/** Validate and normalize a website URL. Returns the canonical http(s)
 *  URL string or null. Rejects javascript:/data:/file:/etc. so a user
 *  can't store a URL that, if rendered as a link, would execute JS. */
function safeWebsite(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = cap(raw.trim(), 256);
  if (!trimmed) return null;
  // Allow plain domains like "example.com" by adding scheme.
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Flip a single target_lists row to approved / pending / removed.
 * 'blacklisted' is reserved for global (admin) blacklisting — not
 * reachable from this UI.
 */
export async function setTargetStatusAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/target-list");

  const targetId = String(formData.get("target_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!targetId) fail("Missing target id.");
  if (!["approved", "pending", "removed"].includes(status)) {
    fail("Invalid status.");
  }

  const now = new Date().toISOString();
  const patch: Record<string, string | null> = {};
  if (status === "approved") {
    patch.status = "approved";
    patch.approved_at = now;
    patch.removed_at = null;
  } else if (status === "removed") {
    patch.status = "removed";
    patch.removed_at = now;
  } else {
    patch.status = "pending";
    patch.approved_at = null;
    patch.removed_at = null;
  }

  const { error } = await supabase
    .from("target_lists")
    .update(patch)
    .eq("id", targetId)
    .eq("athlete_id", user.id);

  if (error) dbFail(error, "setStatus");

  revalidatePath("/target-list");
  revalidatePath("/dashboard");
}

/**
 * Add a business to the athlete's permanent skip list (by name) and
 * mark the matching target_lists row as removed.
 */
export async function skipBusinessFromTargetListAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/target-list");

  const businessId = String(formData.get("business_id") ?? "").trim();
  const businessName = String(formData.get("business_name") ?? "").trim();

  if (!businessId || !businessName) {
    fail("Couldn't skip that business — missing data.");
  }

  const term = normalizeTerm(businessName);

  const { data: athlete, error: readErr } = await supabase
    .from("athletes")
    .select("blacklist_terms")
    .eq("id", user.id)
    .maybeSingle();
  if (readErr) dbFail(readErr, "read");

  const existing = Array.isArray(athlete?.blacklist_terms)
    ? (athlete?.blacklist_terms as string[])
    : [];
  const nextTerms = dedupe([...existing, term]);

  const { error: updErr } = await supabase
    .from("athletes")
    .update({
      blacklist_terms: nextTerms,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updErr) dbFail(updErr, "update");

  const { error: tlErr } = await supabase
    .from("target_lists")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .eq("athlete_id", user.id)
    .eq("business_id", businessId);
  if (tlErr) dbFail(tlErr, "targetList");

  revalidatePath("/target-list");
  revalidatePath("/dashboard");
}

/**
 * Remove a single term from the athlete's blacklist_terms array.
 * Mirror of /signup/review's `unskipTermAction` — used by the chip ×
 * button in the target-list manager's skip list.
 */
export async function unskipTermFromTargetListAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/target-list");

  const term = normalizeTerm(String(formData.get("term") ?? ""));
  if (!term) return;

  const { data: athlete, error: readErr } = await supabase
    .from("athletes")
    .select("blacklist_terms")
    .eq("id", user.id)
    .maybeSingle();
  if (readErr) dbFail(readErr, "read");

  const existing = Array.isArray(athlete?.blacklist_terms)
    ? (athlete?.blacklist_terms as string[])
    : [];
  const nextTerms = existing.filter((t) => t !== term);

  const { error: updErr } = await supabase
    .from("athletes")
    .update({
      blacklist_terms: nextTerms,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updErr) dbFail(updErr, "update");

  revalidatePath("/target-list");
  revalidatePath("/dashboard");
}

/**
 * Add a business to the athlete's permanent skip list **by name only**.
 * Mirror of `skipBusinessByNameAction` in /signup/review — used by the
 * Places-driven skip search at the bottom of the target-list manager.
 * Doesn't require a businesses row or a target_lists row.
 */
export async function skipBusinessByNameFromTargetListAction(
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const term = normalizeTerm(name);
  if (!term) return { ok: false, error: "Empty name." };

  const { data: athlete, error: readErr } = await supabase
    .from("athletes")
    .select("blacklist_terms")
    .eq("id", user.id)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };

  const existing = Array.isArray(athlete?.blacklist_terms)
    ? (athlete?.blacklist_terms as string[])
    : [];
  if (existing.map(normalizeTerm).includes(term)) {
    return { ok: true };
  }
  const nextTerms = dedupe([...existing, term]);

  const { error: updErr } = await supabase
    .from("athletes")
    .update({
      blacklist_terms: nextTerms,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/target-list");
  revalidatePath("/signup/review");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Same pattern as /signup/review — insert a brand-new business and
 * immediately approve it onto this athlete's list.
 */
export async function addManualBusinessToTargetListAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/target-list");

  const name = cap(String(formData.get("name") ?? "").trim(), 120);
  const city = cap(String(formData.get("city") ?? "").trim(), 80);
  const state = cap(String(formData.get("state") ?? "").trim().toUpperCase(), 2);
  const website = safeWebsite(String(formData.get("website") ?? ""));
  const category = cap(String(formData.get("primary_category") ?? "").trim(), 40);

  if (!name || !city || !state || !category) {
    fail("Business name, city, state, and category are required.");
  }

  const validCategoryIds = new Set(CATEGORIES.map((c) => c.id));
  if (!validCategoryIds.has(category)) {
    fail("Pick a valid category.");
  }

  const admin = createAdminClient();

  const { data: inserted, error: insErr } = await admin
    .from("businesses")
    .insert({
      name,
      city,
      state,
      website,
      primary_category: category,
      google_place_id: null,
    })
    .select("id")
    .maybeSingle();

  if (insErr || !inserted) {
    dbFail(insErr ?? null, "addManualBusiness");
  }

  const { error: tlErr } = await admin.from("target_lists").insert({
    athlete_id: user.id,
    business_id: inserted.id,
    status: "approved",
    source_category: category,
    source_city: city,
    approved_at: new Date().toISOString(),
  });

  if (tlErr) dbFail(tlErr, "targetList");

  revalidatePath("/target-list");
  revalidatePath("/dashboard");
}

export type PlacesAddResult = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  city: string | null;
  state: string | null;
  primaryType: string | null;
  rating: number | null;
};

/**
 * Mirror of addPlacesBusinessAction in /signup/review — used from the
 * /target-list page. Returns a result object instead of redirecting so
 * the client component can stay put and show inline confirmation.
 */
export async function addPlacesBusinessToTargetListAction(
  placeId: string,
  result: PlacesAddResult,
  categoryDefault?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (!placeId || !result) {
    return { ok: false, error: "Missing place data." };
  }

  const category = categoryFromPlaceType(
    result.primaryType,
    categoryDefault && CATEGORIES.some((c) => c.id === categoryDefault)
      ? categoryDefault
      : "professional_services"
  );

  const admin = createAdminClient();

  const { data: upserted, error: upsertErr } = await admin
    .from("businesses")
    .upsert(
      {
        google_place_id: placeId,
        name: result.name,
        formatted_address: result.formattedAddress ?? null,
        city: result.city,
        state: result.state,
        primary_category: category,
        google_rating:
          typeof result.rating === "number" ? result.rating : null,
        last_google_sync_at: new Date().toISOString(),
      },
      { onConflict: "google_place_id" }
    )
    .select("id, global_blacklisted")
    .maybeSingle();

  if (upsertErr || !upserted) {
    return {
      ok: false,
      error: upsertErr?.message ?? "Couldn't save that business.",
    };
  }

  if (upserted.global_blacklisted) {
    return {
      ok: false,
      error: "That business isn't available on NILPro.",
    };
  }

  const { error: tlErr } = await admin.from("target_lists").upsert(
    {
      athlete_id: user.id,
      business_id: upserted.id,
      status: "approved",
      source_category: category,
      source_city: result.city ?? null,
      approved_at: new Date().toISOString(),
      removed_at: null,
    },
    { onConflict: "athlete_id,business_id" }
  );

  if (tlErr) {
    return { ok: false, error: tlErr.message };
  }

  revalidatePath("/target-list");
  revalidatePath("/dashboard");
  return { ok: true };
}
