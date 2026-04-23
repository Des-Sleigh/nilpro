"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/signup/review?error=${encodeURIComponent(msg)}`);
}

/**
 * Mark one business global_blacklisted (never shown to any athlete again)
 * and the athlete's own target_list row 'blacklisted'. Called via a small
 * per-row form; stays on /signup/review.
 */
export async function blacklistBusinessAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const businessId = String(formData.get("business_id") ?? "");
  if (!businessId) fail("Missing business.");

  // Use the admin client — businesses.global_blacklisted isn't updatable by
  // a regular authed user (RLS denies writes on businesses).
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { error: bizErr } = await admin
    .from("businesses")
    .update({
      global_blacklisted: true,
      blacklisted_reason: `athlete-request:${user.id}`,
    })
    .eq("id", businessId);
  if (bizErr) fail(bizErr.message);

  const { error: tlErr } = await supabase
    .from("target_lists")
    .update({
      status: "blacklisted",
      removed_at: new Date().toISOString(),
    })
    .eq("athlete_id", user.id)
    .eq("business_id", businessId);
  if (tlErr) fail(tlErr.message);

  revalidatePath("/signup/review");
  redirect("/signup/review");
}

/**
 * Final submit for the review screen. We look at which business_ids are
 * checked in the form, mark those 'approved', and mark every other pending
 * row 'removed'.
 */
export async function submitReviewAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

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

  revalidatePath("/signup/deal-menu");
  redirect("/signup/deal-menu");
}
