"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_PLATFORMS = ["instagram", "tiktok"] as const;
type Platform = (typeof VALID_PLATFORMS)[number];

function fail(msg: string): never {
  redirect(`/signup/verify?error=${encodeURIComponent(msg)}`);
}

function genVerificationCode(): string {
  // 6-digit numeric, zero-padded.
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sanitizeHandle(raw: string): string {
  // Strip leading @, whitespace, and lowercase. Keep dots/underscores.
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/**
 * Step 3a: submit platform + handle, generate a verification code,
 * upsert social_accounts. We stay on /signup/verify and show the
 * instructions UI (driven by the ?sent=1 query param).
 */
export async function startVerificationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const platformRaw = String(formData.get("platform") ?? "") as Platform;
  const handleRaw = String(formData.get("handle") ?? "");

  if (!VALID_PLATFORMS.includes(platformRaw)) fail("Pick a platform.");

  const handle = sanitizeHandle(handleRaw);
  if (!handle || handle.length < 2) fail("Enter your handle.");
  if (!/^[a-z0-9._]+$/.test(handle)) {
    fail("Handles can only contain letters, numbers, dots, and underscores.");
  }

  const code = genVerificationCode();

  // We remove any pre-existing rows for this athlete so they can switch
  // platform without hitting the (athlete_id, platform) unique constraint.
  await supabase.from("social_accounts").delete().eq("athlete_id", user.id);

  const { error } = await supabase.from("social_accounts").insert({
    athlete_id: user.id,
    platform: platformRaw,
    handle,
    verified: false,
    verification_code: code,
    verification_code_sent_at: new Date().toISOString(),
  });

  if (error) fail(error.message);

  revalidatePath("/signup/verify");
  redirect(
    `/signup/verify?sent=1&platform=${encodeURIComponent(
      platformRaw
    )}&handle=${encodeURIComponent(handle)}&code=${encodeURIComponent(code)}`
  );
}

/**
 * Step 3b: athlete confirms they've sent the DM. We don't actually
 * verify in Phase 1 — just move on. The admin will manually flip
 * `verified` in the DB within 24 hours.
 */
export async function confirmDmSentAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  // Sanity check that a social_accounts row actually exists.
  const { data: social } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();

  if (!social) fail("Submit your handle first.");

  revalidatePath("/signup/verify");
  redirect("/signup/deal-menu");
}
