"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO", "HS", "Club"] as const;
type Level = (typeof VALID_LEVELS)[number];

function fail(msg: string): never {
  redirect(`/settings/profile?error=${encodeURIComponent(msg)}`);
}

/** Generic error redirect for DB failures. Logs underlying PG error
 *  server-side and surfaces a generic message to the user. Audit Cat 5. */
function dbFail(err: { message?: string } | null, where: string): never {
  if (err) console.error(`[profile/${where}] db error:`, err.message);
  fail("Couldn't save — try again.");
}

function cleanHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/** Cap string to maxLen characters and strip control chars. Audit Cat 5
 *  (input length caps): users can otherwise stuff multi-MB strings into
 *  text fields that flow into emails / admin pages. */
function cap(raw: string | null | undefined, maxLen: number): string {
  if (!raw) return "";
  // Strip ASCII control chars (0x00-0x1F except \t \n) which aren't valid
  // in any field we collect.
  const cleaned = String(raw).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

export async function saveProfileSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/settings/profile");

  const firstName = cap(String(formData.get("first_name") ?? "").trim(), 80);
  const lastName = cap(String(formData.get("last_name") ?? "").trim(), 80);

  // Multi-sport. See app/signup/profile/actions.ts for the contract:
  // repeated `sports` + `positions` form fields, paired by index.
  const sportsRaw = formData.getAll("sports").map((v) => String(v).trim());
  const positionsRaw = formData
    .getAll("positions")
    .map((v) => String(v).trim());
  const sports: string[] = [];
  const positions: string[] = [];
  for (let i = 0; i < sportsRaw.length; i++) {
    const s = sportsRaw[i];
    if (!s) continue;
    sports.push(s);
    positions.push(positionsRaw[i] ?? "");
  }
  const legacySport = String(formData.get("sport") ?? "").trim();
  const legacyPosition = String(formData.get("position") ?? "").trim();
  const sport = sports[0] ?? legacySport;
  const position = (positions[0] ?? legacyPosition) || null;
  const level = String(formData.get("level") ?? "") as Level;
  const school = cap(String(formData.get("school") ?? "").trim(), 120);
  const gradYearRaw = String(formData.get("graduation_year") ?? "");
  const hometownCity = cap(String(formData.get("hometown_city") ?? "").trim(), 80);
  const hometownState = cap(
    String(formData.get("hometown_state") ?? "").trim().toUpperCase(),
    2
  );
  const igHandle = cap(
    cleanHandle(String(formData.get("instagram_handle") ?? "")),
    30
  );
  const tiktokHandleRaw = cap(
    cleanHandle(String(formData.get("tiktok_handle") ?? "")),
    30
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
      sports: sports.length > 0 ? sports : sport ? [sport] : null,
      positions:
        sports.length > 0
          ? positions
          : position
          ? [position]
          : null,
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
    if (error) dbFail(error, "save");
  } else {
    const { error } = await supabase.from("social_accounts").insert({
      athlete_id: user.id,
      platform: "instagram",
      handle: igHandle,
    });
    if (error) dbFail(error, "save");
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
      if (error) dbFail(error, "save");
    } else {
      const { error } = await supabase.from("social_accounts").insert({
        athlete_id: user.id,
        platform: "tiktok",
        handle: tiktokHandleRaw,
      });
      if (error) dbFail(error, "save");
    }
  } else if (existingTt) {
    const { error } = await supabase
      .from("social_accounts")
      .delete()
      .eq("id", existingTt.id);
    if (error) dbFail(error, "save");
  }

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  // Back to the dashboard so the athlete sees their change reflected.
  redirect("/dashboard");
}
