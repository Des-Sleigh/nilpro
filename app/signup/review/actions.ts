"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES } from "@/lib/places/categories";

function fail(msg: string): never {
  redirect(`/signup/review?error=${encodeURIComponent(msg)}`);
}

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

/**
 * Final submit for the review screen. Saves the athlete's skip-list
 * (populated on the client as the athlete skips individual rows),
 * approves every checked business_id, marks the rest 'removed', and
 * advances to the photo step.
 */
export async function submitReviewAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const blacklistTerms = dedupe(
    formData.getAll("blacklist_terms").map((v) => String(v))
  );

  const { error: athleteErr } = await supabase
    .from("athletes")
    .update({
      blacklist_terms: blacklistTerms,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (athleteErr) fail(athleteErr.message);

  const includedIds = new Set(
    formData.getAll("include").map((v) => String(v))
  );

  const { data: pendingRows, error: fetchErr } = await supabase
    .from("target_lists")
    .select("id, business_id")
    .eq("athlete_id", user.id)
    .eq("status", "pending");
  if (fetchErr) fail(fetchErr.message);

  const now = new Date().toISOString();
  const approvedIds: string[] = [];
  const removedIds: string[] = [];

  for (const row of pendingRows ?? []) {
    if (includedIds.has(row.business_id)) {
      approvedIds.push(row.id);
    } else {
      removedIds.push(row.id);
    }
  }

  if (approvedIds.length > 0) {
    const { error } = await supabase
      .from("target_lists")
      .update({ status: "approved", approved_at: now })
      .in("id", approvedIds);
    if (error) fail(error.message);
  }

  if (removedIds.length > 0) {
    const { error } = await supabase
      .from("target_lists")
      .update({ status: "removed", removed_at: now })
      .in("id", removedIds);
    if (error) fail(error.message);
  }

  // Per founder decision: the /signup/photo and /signup/done pages are
  // removed. After approving the target list, land straight on the
  // dashboard. The dashboard's ActionBanner surfaces "what's next".
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Add a business (by name) to the athlete's personal skip list AND
 * mark that athlete's existing target_lists row for it as 'removed'.
 * Takes business_id + the business name so we can add the name as a
 * blacklist term without re-querying.
 */
export async function skipBusinessAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

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
  if (readErr) fail(readErr.message);

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
  if (updErr) fail(updErr.message);

  const { error: tlErr } = await supabase
    .from("target_lists")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .eq("athlete_id", user.id)
    .eq("business_id", businessId);
  if (tlErr) fail(tlErr.message);

  revalidatePath("/signup/review");
}

/**
 * Remove a single term from the athlete's blacklist_terms array.
 */
export async function unskipTermAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const term = normalizeTerm(String(formData.get("term") ?? ""));
  if (!term) return;

  const { data: athlete, error: readErr } = await supabase
    .from("athletes")
    .select("blacklist_terms")
    .eq("id", user.id)
    .maybeSingle();
  if (readErr) fail(readErr.message);

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
  if (updErr) fail(updErr.message);

  revalidatePath("/signup/review");
}

export type ManualBusinessPayload = {
  name: string;
  city: string;
  state: string;
  website: string | null;
  primary_category: string;
};

/**
 * Insert a brand-new business the athlete added manually, then approve
 * it onto their target list. Uses the admin client because businesses
 * + target_lists are server-only writes. Minimal validation.
 */
export async function addManualBusinessAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const websiteRaw = String(formData.get("website") ?? "").trim();
  const website = websiteRaw.length > 0 ? websiteRaw : null;
  const category = String(formData.get("primary_category") ?? "").trim();

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
    fail(insErr?.message ?? "Couldn't add that business.");
  }

  const { error: tlErr } = await admin.from("target_lists").insert({
    athlete_id: user.id,
    business_id: inserted.id,
    status: "approved",
    source_category: category,
    source_city: city,
    approved_at: new Date().toISOString(),
  });

  if (tlErr) fail(tlErr.message);

  revalidatePath("/signup/review");
  revalidatePath("/target-list");
}
