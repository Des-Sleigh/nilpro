"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { newParentToken } from "@/lib/email/parentTokens";
import {
  sendParentConsentEmail,
  consentResultSent,
} from "@/lib/email/parentConsent";

/** Triggered from the athlete's dashboard ActionBanner ("Resend email").
 *  Rotates the token (so the previous link is invalidated) but keeps the
 *  same fallback code so the dashboard banner / any prior verbal share
 *  still works. */
export async function resendParentConsentAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/dashboard");

  const { data: athlete } = await supabase
    .from("athletes")
    .select(
      "id, first_name, last_name, is_minor, parent_email, parent_first_name, parent_approval_code, parent_approved_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  // Defensive: only minors with a parent email and no existing approval.
  if (
    !athlete.is_minor ||
    !athlete.parent_email ||
    !athlete.parent_first_name ||
    athlete.parent_approved_at
  ) {
    revalidatePath("/dashboard");
    return;
  }

  // Keep the existing code if we have one; otherwise the row was created
  // before migration 0008 — bail rather than send a link without a code.
  const code = (athlete.parent_approval_code as string | null) ?? null;
  if (!code) {
    revalidatePath("/dashboard");
    return;
  }

  const newToken = newParentToken();
  await supabase
    .from("athletes")
    .update({
      parent_approval_token: newToken,
      parent_approval_token_sent_at: new Date().toISOString(),
    })
    .eq("id", user.id);

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

  await supabase
    .from("athletes")
    .update({ parent_approval_email_status: status })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  // Drop a flag in the URL so the dashboard can flip the resend button
  // to the green "✓ Email sent" pill for a moment after this returns.
  redirect("/dashboard?email_resent=1");
}
