"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO", "HS", "Club"] as const;
type Level = (typeof VALID_LEVELS)[number];

function fail(msg: string): never {
  redirect(`/settings/profile?error=${encodeURIComponent(msg)}`);
}

function cleanHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export async function saveProfileSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/settings/profile");

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim() || null;
  const level = String(formData.get("level") ?? "") as Level;
  const school = String(formData.get("school") ?? "").trim();
  const gradYearRaw = String(formData.get("graduation_year") ?? "");
  const hometownCity = String(formData.get("hometown_city") ?? "").trim();
  const hometownState = String(formData.get("hometown_state") ?? "")
    .trim()
    .toUpperCase();
  const igHandle = cleanHandle(String(formData.get("instagram_handle") ?? ""));
  const tiktokHandleRaw = cleanHandle(
    String(formData.get("tiktok_handle") ?? "")
  );

  if (!firstName || !lastName) fail("First and last name are required.");
  if (!sport) fail("Which sport do you play?");
  if (!VALID_LEVELS.includes(level)) fail("Pick your level.");
  if (!school) fail("Which school?");
  if (!hometownCity || !hometownState)
    fail("Add your hometown city and state.");
  if (!igHandle) fail("Instagram handle is required.");

  const gradYear = Number(gradYearRaw);
  if (!Number.isFinite(gradYear) || gradYear < 2020 || gradYear > 2040) {
    fail("Pick a valid graduation year.");
  }

  const { error: athleteErr } = await supabase
    .from("athletes")
    .update({
      first_name: firstName,
      last_name: lastName,
      sport,
      position,
      level,
      school,
      graduation_year: gradYear,
      hometown_city: hometownCity,
      hometown_state: hometownState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (athleteErr) fail(athleteErr.message);

  // Upsert Instagram social account. Don't stomp verified flag if it's
  // already set and handle didn't change — read first.
  const { data: existingIg } = await supabase
    .from("social_accounts")
    .select("id, handle, verified")
    .eq("athlete_id", user.id)
    .eq("platform", "instagram")
    .maybeSingle();

  if (existingIg) {
    const handleChanged = existingIg.handle !== igHandle;
    const { error } = await supabase
      .from("social_accounts")
      .update({
        handle: igHandle,
        // Changing handle invalidates verification.
        verified: handleChanged ? false : existingIg.verified,
        verified_at: handleChanged ? null : undefined,
      })
      .eq("id", existingIg.id);
    if (error) fail(error.message);
  } else {
    const { error } = await supabase.from("social_accounts").insert({
      athlete_id: user.id,
      platform: "instagram",
      handle: igHandle,
    });
    if (error) fail(error.message);
  }

  // TikTok is optional — upsert if present, delete if cleared.
  const { data: existingTt } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .eq("platform", "tiktok")
    .maybeSingle();

  if (tiktokHandleRaw) {
    if (existingTt) {
      const { error } = await supabase
        .from("social_accounts")
        .update({ handle: tiktokHandleRaw })
        .eq("id", existingTt.id);
      if (error) fail(error.message);
    } else {
      const { error } = await supabase.from("social_accounts").insert({
        athlete_id: user.id,
        platform: "tiktok",
        handle: tiktokHandleRaw,
      });
      if (error) fail(error.message);
    }
  } else if (existingTt) {
    const { error } = await supabase
      .from("social_accounts")
      .delete()
      .eq("id", existingTt.id);
    if (error) fail(error.message);
  }

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  // Back to the dashboard so the athlete sees their change reflected.
  redirect("/dashboard");
}
