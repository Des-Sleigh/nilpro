"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES, categoryFromPlaceType } from "@/lib/places/categories";
import { sendWelcomeEmail } from "@/lib/email/welcome";

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

  // Welcome email — only when this submit actually approved at least
  // one business. Never block the redirect on email outcome. We use the
  // admin client to read auth.users for the email; athletes table only
  // stores first_name, not the auth-side email.
  if (approvedIds.length > 0) {
    try {
      const admin = createAdminClient();
      const [athleteRes, userRes] = await Promise.all([
        admin
          .from("athletes")
          .select("first_name")
          .eq("id", user.id)
          .maybeSingle(),
        admin.auth.admin.getUserById(user.id),
      ]);

      const firstName = (athleteRes.data?.first_name as string | undefined) ?? "";
      const athleteEmail = userRes.data?.user?.email ?? null;

      if (firstName && athleteEmail) {
        const hdrs = await headers();
        const origin =
          hdrs.get("origin") ??
          (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenilpro.com");
        await sendWelcomeEmail({
          athleteFirstName: firstName,
          athleteEmail,
          dashboardUrl: `${origin}/dashboard`,
        });
      }
    } catch (err) {
      // Never fail the action on email — just log.
      console.error(
        `[review/submit] welcome email failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
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
 * Add a business to the athlete's permanent skip list **by name only**.
 *
 * This differs from `skipBusinessAction` in that it doesn't require an
 * existing `businesses` row or a `target_lists` row — it just appends
 * the normalized name to `athletes.blacklist_terms`. Used by the new
 * Places-driven skip-list search (review screen + target-list manager)
 * so athletes can pre-emptively skip businesses Google knows about
 * before our cache ever sees them.
 *
 * Returns `{ ok }` instead of redirecting so the AddBusinessSearch
 * client component can show inline confirmation and stay put.
 */
export async function skipBusinessByNameAction(
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
    // Already on the list — treat as success so the UI shows ✓.
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

  revalidatePath("/signup/review");
  revalidatePath("/target-list");
  return { ok: true };
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
 * Add a business to this athlete's target list from a Google Places
 * search result. Upserts into `businesses` keyed on google_place_id so
 * repeat adds across athletes reuse the same row.
 *
 * Returns `{ ok: true }` on success or `{ ok: false, error }` so the
 * client can surface a toast. Never redirects — this is called from a
 * client component that wants to stay put.
 */
export async function addPlacesBusinessAction(
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

  // Upsert the target_lists row — approve straight away.
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

  revalidatePath("/signup/review");
  revalidatePath("/target-list");
  revalidatePath("/dashboard");
  return { ok: true };
}
