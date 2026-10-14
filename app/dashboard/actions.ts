"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/site";
import { newParentToken, newUniqueParentCode } from "@/lib/email/parentTokens";
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

  // The consent columns are protected by the 0012 trigger, so an update
  // through the athlete's own session is rejected. Ownership was
  // established above (row read via RLS for the signed-in user); the
  // writes themselves go through the service role.
  const admin = createAdminClient();

  // Keep the existing code so anything already shared with the parent
  // still works. Rows created before migration 0008 (or whose duplicate
  // code was cleared by 0014) get a fresh one.
  let code = (athlete.parent_approval_code as string | null) ?? null;
  if (!code) {
    try {
      code = await newUniqueParentCode(admin);
    } catch (err) {
      console.error(
        `[dashboard/resend] ${err instanceof Error ? err.message : String(err)}`
      );
      redirect("/dashboard?email_resent=0");
    }
  }

  const newToken = newParentToken();
  const { error: tokenErr } = await admin
    .from("athletes")
    .update({
      parent_approval_token: newToken,
      parent_approval_code: code,
      parent_approval_token_sent_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  // Never email a link whose token didn't persist — it would 404.
  if (tokenErr) {
    console.error(`[dashboard/resend] token rotate failed: ${tokenErr.message}`);
    redirect("/dashboard?email_resent=0");
  }

  const approveUrl = absoluteUrl(`/parent/approve?token=${newToken}`);

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

  const { error: statusErr } = await admin
    .from("athletes")
    .update({ parent_approval_email_status: status })
    .eq("id", user.id);
  if (statusErr) {
    console.error(`[dashboard/resend] status write failed: ${statusErr.message}`);
  }

  revalidatePath("/dashboard");
  // Drop a flag in the URL so the dashboard can flip the resend button
  // to the green "✓ Email sent" pill for a moment after this returns.
  redirect(`/dashboard?email_resent=${status === "sent" ? 1 : 0}`);
}
