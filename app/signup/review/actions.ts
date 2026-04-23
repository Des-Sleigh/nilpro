"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/signup/review?error=${encodeURIComponent(msg)}`);
}

/**
 * Parse the skip-list textarea. Trims each line, lowercases (so the
 * outreach filter can do simple case-insensitive substring matching),
 * drops empties and duplicates.
 */
function parseBlacklistTerms(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim().toLowerCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Final submit for the review screen. Persists the athlete's skip-list,
 * approves every business_id checked in the form, and marks every other
 * pending row 'removed'. Then redirects to /dashboard (the photo step
 * isn't built yet — we skip it cleanly).
 */
export async function submitReviewAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const blacklistRaw = String(formData.get("blacklist_terms") ?? "");
  const blacklistTerms = parseBlacklistTerms(blacklistRaw);

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

  // Photo + done steps aren't built yet — skip straight to dashboard.
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
