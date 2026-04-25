"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { newParentToken, newParentCode } from "@/lib/email/parentTokens";
import {
  sendParentConsentEmail,
  consentResultSent,
} from "@/lib/email/parentConsent";

const VALID_TIERS = ["starter", "pro", "champion"] as const;
const VALID_SUB_STATUSES = ["trial", "active", "canceled", "past_due"] as const;
const VALID_PITCH_STATUSES = [
  "queued",
  "sent",
  "opened",
  "replied_yes",
  "replied_counter",
  "replied_no",
  "unsubscribed",
  "no_response",
  "bounced",
] as const;

function refresh(athleteId: string) {
  revalidatePath(`/admin/athletes/${athleteId}`);
  revalidatePath("/admin/athletes");
  revalidatePath("/admin");
  revalidatePath("/admin/queue");
}

export async function verifyAthleteAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();
  // Find or create the IG row.
  const { data: existing } = await sb
    .from("social_accounts")
    .select("id, verified")
    .eq("athlete_id", athleteId)
    .eq("platform", "instagram")
    .maybeSingle();

  if (existing) {
    await sb
      .from("social_accounts")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", existing.id);
  }
  refresh(athleteId);
}

export async function unverifyAthleteAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();
  const { data: existing } = await sb
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", athleteId)
    .eq("platform", "instagram")
    .maybeSingle();

  if (existing) {
    await sb
      .from("social_accounts")
      .update({ verified: false, verified_at: null })
      .eq("id", existing.id);
  }
  refresh(athleteId);
}

export async function approveParentAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();
  await sb
    .from("athletes")
    .update({ parent_approved_at: new Date().toISOString() })
    .eq("id", athleteId);
  refresh(athleteId);
}

/** Admin-triggered re-send of the parent-consent email. Rotates the token
 *  and (if missing) backfills a fallback code so the dashboard share-line
 *  works for athletes whose row pre-dates migration 0008. */
export async function adminResendParentConsentAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();
  const { data: athlete } = await sb
    .from("athletes")
    .select(
      "id, first_name, last_name, is_minor, parent_email, parent_first_name, parent_approval_code, parent_approved_at"
    )
    .eq("id", athleteId)
    .maybeSingle();

  if (
    !athlete ||
    !athlete.is_minor ||
    !athlete.parent_email ||
    !athlete.parent_first_name ||
    athlete.parent_approved_at
  ) {
    refresh(athleteId);
    return;
  }

  const code =
    (athlete.parent_approval_code as string | null) ?? newParentCode();
  const newToken = newParentToken();

  await sb
    .from("athletes")
    .update({
      parent_approval_token: newToken,
      parent_approval_code: code,
      parent_approval_token_sent_at: new Date().toISOString(),
    })
    .eq("id", athleteId);

  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ??
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenilpro.com");
  const approveUrl = `${origin}/parent/approve?token=${newToken}`;

  const result = await sendParentConsentEmail({
    athleteFirstName: athlete.first_name as string,
    athleteLastName: (athlete.last_name as string | null) ?? "",
    parentFirstName: athlete.parent_first_name as string,
    parentEmail: athlete.parent_email as string,
    approveUrl,
    fallbackCode: code,
  });

  const status = result.skipped
    ? "skipped"
    : consentResultSent(result)
    ? "sent"
    : "failed";

  await sb
    .from("athletes")
    .update({ parent_approval_email_status: status })
    .eq("id", athleteId);

  refresh(athleteId);
}

export async function revokeParentAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();
  await sb
    .from("athletes")
    .update({ parent_approved_at: null })
    .eq("id", athleteId);
  refresh(athleteId);
}

export async function setSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const tierRaw = String(formData.get("tier") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();

  if (status === "inactive") {
    await sb
      .from("athletes")
      .update({ subscription_status: null, subscription_tier: null })
      .eq("id", athleteId);
    refresh(athleteId);
    return;
  }

  if (!VALID_SUB_STATUSES.includes(status as (typeof VALID_SUB_STATUSES)[number])) {
    return;
  }
  const tier = VALID_TIERS.includes(tierRaw as (typeof VALID_TIERS)[number])
    ? tierRaw
    : null;

  await sb
    .from("athletes")
    .update({ subscription_status: status, subscription_tier: tier })
    .eq("id", athleteId);
  refresh(athleteId);
}

export async function saveAthleteNotesAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  const notes = String(formData.get("admin_notes") ?? "");
  if (!athleteId) return;

  const sb = createAdminClient();
  await sb
    .from("athletes")
    .update({ admin_notes: notes })
    .eq("id", athleteId);
  refresh(athleteId);
}

export async function logPitchAction(formData: FormData) {
  await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "");
  const businessId = String(formData.get("business_id") ?? "");
  const targetListId = String(formData.get("target_list_id") ?? "") || null;
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!athleteId || !businessId) return;

  const sb = createAdminClient();
  await sb.from("pitches").insert({
    athlete_id: athleteId,
    business_id: businessId,
    target_list_id: targetListId,
    status: "sent",
    subject,
    body,
    sent_via: "manual",
    notes,
    sent_at: new Date().toISOString(),
  });
  refresh(athleteId);
  revalidatePath("/admin/pitches");
}

export async function setPitchStatusInlineAction(formData: FormData) {
  // Used from the athlete detail page to update inline.
  await requireAdmin();
  const pitchId = String(formData.get("pitch_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const athleteId = String(formData.get("athlete_id") ?? "");
  if (!pitchId || !VALID_PITCH_STATUSES.includes(status as (typeof VALID_PITCH_STATUSES)[number])) {
    return;
  }
  const sb = createAdminClient();
  const updates: Record<string, unknown> = { status };
  if (status.startsWith("replied_")) {
    updates.responded_at = new Date().toISOString();
  }
  await sb.from("pitches").update(updates).eq("id", pitchId);
  if (athleteId) refresh(athleteId);
  revalidatePath("/admin/pitches");
}
