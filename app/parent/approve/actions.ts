"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, consumeRateLimit } from "@/lib/rateLimit";
import { absoluteUrl } from "@/lib/site";
import { sendParentApprovedAthleteEmail } from "@/lib/email/parentApprovedAthlete";

// Code entry is the brute-forceable surface (1M combinations); the link
// path uses a UUID so it doesn't need throttling. The limit is stored in
// Postgres so it holds across serverless instances: 10 attempts / 5 min
// per IP, plus a global ceiling that caps distributed guessing.
const CODE_ATTEMPTS_PER_IP = 10;
const CODE_ATTEMPTS_GLOBAL = 300;
const CODE_WINDOW_SEC = 300;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

/** Marks the athlete row as parent-approved and clears the token so
 *  the link can't be reused. The fallback code is also cleared (the
 *  approval is a terminal state — no need to keep either credential). */
export async function approveByTokenAction(formData: FormData): Promise<void> {
  const tokenRaw = String(formData.get("token") ?? "").trim();
  if (!isUuid(tokenRaw)) {
    redirect("/parent/approve?error=invalid");
  }

  const sb = createAdminClient();
  const { data: athlete, error } = await sb
    .from("athletes")
    .select(
      "id, parent_approved_at, first_name, parent_first_name, parent_approval_token_sent_at"
    )
    .eq("parent_approval_token", tokenRaw)
    .maybeSingle();

  if (error || !athlete) {
    redirect("/parent/approve?error=not_found");
  }

  // Already approved? Just bounce to the success state.
  if (athlete.parent_approved_at) {
    redirect("/parent/approve?approved=1");
  }

  // Reject tokens older than 30 days. If a parent's email is later
  // compromised, the consent link can't be replayed against an old token.
  // Admins can re-issue via adminResendParentConsentAction.
  const sentAt = athlete.parent_approval_token_sent_at as string | null;
  if (sentAt) {
    const ageMs = Date.now() - new Date(sentAt).getTime();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    if (ageMs > THIRTY_DAYS_MS) {
      redirect("/parent/approve?error=expired");
    }
  }

  const { error: updErr } = await sb
    .from("athletes")
    .update({
      parent_approved_at: new Date().toISOString(),
      parent_approval_token: null,
      parent_approval_code: null,
    })
    .eq("id", athlete.id);

  if (updErr) {
    console.error(`[parent/approve] update failed: ${updErr.message}`);
    redirect("/parent/approve?error=server");
  }

  // Best-effort: notify the athlete that their parent approved. Never
  // block the parent's redirect on email outcome.
  try {
    const userRes = await sb.auth.admin.getUserById(athlete.id as string);
    const athleteEmail = userRes.data?.user?.email ?? null;
    const firstName =
      (athlete.first_name as string | null | undefined) ?? "";
    const parentFirstName =
      (athlete.parent_first_name as string | null | undefined) ?? "your parent";
    if (athleteEmail && firstName) {
      await sendParentApprovedAthleteEmail({
        athleteFirstName: firstName,
        athleteEmail,
        parentFirstName,
        dashboardUrl: absoluteUrl("/dashboard"),
      });
    }
  } catch (err) {
    console.error(
      `[parent/approve] athlete-notify email failed: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/queue");
  revalidatePath(`/admin/athletes/${athlete.id}`);

  redirect("/parent/approve?approved=1");
}

/** Code-entry path: parent types the 6-digit code into the form, we look
 *  up the matching token, then redirect into the unified token flow so
 *  the same approval card renders. */
export async function lookUpByCodeAction(formData: FormData): Promise<void> {
  const ip = await clientIp();
  const [ipOk, globalOk] = await Promise.all([
    consumeRateLimit(`parent-code:ip:${ip}`, CODE_ATTEMPTS_PER_IP, CODE_WINDOW_SEC),
    consumeRateLimit("parent-code:global", CODE_ATTEMPTS_GLOBAL, CODE_WINDOW_SEC),
  ]);
  if (!ipOk || !globalOk) {
    redirect("/parent/approve?error=rate_limited");
  }

  const codeRaw = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(codeRaw)) {
    redirect("/parent/approve?error=bad_code");
  }

  const sb = createAdminClient();
  const { data: athlete } = await sb
    .from("athletes")
    .select("id, parent_approval_token")
    .eq("parent_approval_code", codeRaw)
    .maybeSingle();

  if (!athlete || !athlete.parent_approval_token) {
    redirect("/parent/approve?error=bad_code");
  }

  redirect(`/parent/approve?token=${athlete.parent_approval_token}`);
}
