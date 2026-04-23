"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO", "HS", "Club"] as const;
type Level = (typeof VALID_LEVELS)[number];

function fail(msg: string): never {
  redirect(`/signup/profile?error=${encodeURIComponent(msg)}`);
}

function ageFromDob(dob: string): number {
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function genReferralCode(): string {
  // 8-char uppercase alphanumeric, no ambiguous chars (0/O, 1/I).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function saveProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup/create");

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim() || null;
  const level = String(formData.get("level") ?? "") as Level;
  const dob = String(formData.get("date_of_birth") ?? "");
  const gradYearRaw = String(formData.get("graduation_year") ?? "");
  const school = String(formData.get("school") ?? "").trim();
  const hometownCity = String(formData.get("hometown_city") ?? "").trim();
  const hometownState = String(formData.get("hometown_state") ?? "").trim();
  const parentFirstName =
    String(formData.get("parent_first_name") ?? "").trim() || null;
  const parentEmail =
    String(formData.get("parent_email") ?? "").trim().toLowerCase() || null;

  if (!firstName || !lastName) fail("First and last name are required.");
  if (!sport) fail("Which sport do you play?");
  if (!VALID_LEVELS.includes(level)) fail("Pick your level.");
  if (!dob) fail("Add your date of birth.");
  if (!school) fail("Which school?");
  if (!hometownCity || !hometownState) fail("Add your hometown city and state.");

  const age = ageFromDob(dob);
  if (age < 13) fail("You must be at least 13 to use NILPro.");
  if (age > 100) fail("Double-check your date of birth.");

  const isMinor = age < 18;
  if (isMinor && (!parentEmail || !parentFirstName)) {
    fail("Since you're under 18, we need a parent's first name and email.");
  }

  const gradYear = Number(gradYearRaw);
  if (!Number.isFinite(gradYear) || gradYear < 2020 || gradYear > 2040) {
    fail("Pick a valid graduation year.");
  }

  // Generate a referral code; retry a few times if we hit a collision.
  let referralCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = genReferralCode();
    const { data: existing } = await supabase
      .from("athletes")
      .select("id")
      .eq("referral_code", candidate)
      .maybeSingle();
    if (!existing) {
      referralCode = candidate;
      break;
    }
  }
  if (!referralCode) fail("Couldn't generate a referral code — try again.");

  const referredBy =
    (user.user_metadata?.referred_by_code as string | undefined) ?? null;

  const { error } = await supabase.from("athletes").insert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    sport,
    position,
    level,
    school,
    graduation_year: gradYear,
    date_of_birth: dob,
    hometown_city: hometownCity,
    hometown_state: hometownState,
    is_minor: isMinor,
    parent_first_name: isMinor ? parentFirstName : null,
    parent_email: isMinor ? parentEmail : null,
    referral_code: referralCode,
    referred_by_code: referredBy,
  });

  if (error) fail(error.message);

  revalidatePath("/", "layout");
  redirect("/signup/verify");
}
