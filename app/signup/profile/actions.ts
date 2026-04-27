"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { newParentToken, newParentCode } from "@/lib/email/parentTokens";
import {
  sendParentConsentEmail,
  consentResultSent,
} from "@/lib/email/parentConsent";
import { hsNilStatusFor, stateName } from "@/lib/states/nilStatus";

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

  // Multi-sport: read paired arrays from repeated form fields. The
  // length of `sports[]` and `positions[]` matches because the UI
  // always submits both inputs per row (position can be empty).
  const sportsRaw = formData.getAll("sports").map((v) => String(v).trim());
  const positionsRaw = formData
    .getAll("positions")
    .map((v) => String(v).trim());
  const sports: string[] = [];
  const positions: string[] = [];
  for (let i = 0; i < sportsRaw.length; i++) {
    const s = sportsRaw[i];
    if (!s) continue; // drop rows without a sport — position alone is meaningless
    sports.push(s);
    positions.push(positionsRaw[i] ?? "");
  }
  // Singular columns mirror the first non-empty entry — backwards
  // compat for admin views and the dashboard hero. Falls back to the
  // legacy single-input form if the new array fields aren't sent.
  const legacySport = String(formData.get("sport") ?? "").trim();
  const legacyPosition = String(formData.get("position") ?? "").trim();
  const sport = sports[0] ?? legacySport;
  const position = (positions[0] ?? legacyPosition) || null;
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

  // HS NIL state gating: block hard-banned states; flag partial states.
  // College NIL is legal in all 50 states + DC, so this only matters for
  // level === "HS".
  const hsStatus = hsNilStatusFor(hometownState);
  if (level === "HS" && hsStatus === "off") {
    fail(
      `Sorry — high-school NIL isn't permitted in ${stateName(
        hometownState
      )} yet. Once your state allows it, you'll be welcome here.`
    );
  }
  const hsStateRestricted = level === "HS" && hsStatus === "partial";

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

  // For minors, generate the approval token + fallback code up front so
  // both go in on the initial INSERT (single round-trip, no race window
  // where a row exists without its consent state).
  const parentToken = isMinor ? newParentToken() : null;
  const parentCode = isMinor ? newParentCode() : null;
  const parentSentAt = isMinor ? new Date().toISOString() : null;

  const { error } = await supabase.from("athletes").insert({
    id: user.id,
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
    date_of_birth: dob,
    hometown_city: hometownCity,
    hometown_state: hometownState,
    is_minor: isMinor,
    parent_first_name: isMinor ? parentFirstName : null,
    parent_email: isMinor ? parentEmail : null,
    parent_approval_token: parentToken,
    parent_approval_code: parentCode,
    parent_approval_token_sent_at: parentSentAt,
    hs_state_restricted: hsStateRestricted,
    referral_code: referralCode,
    referred_by_code: referredBy,
  });

  if (error) fail(error.message);

  // Fire the consent email if this athlete is a minor. We never block the
  // signup on email delivery — if Resend is misconfigured or the send
  // fails, the athlete still gets the fallback code in their dashboard
  // banner. We do record the outcome on the row so admins can see it.
  if (isMinor && parentEmail && parentFirstName && parentToken && parentCode) {
    const hdrs = await headers();
    const origin =
      hdrs.get("origin") ??
      (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenilpro.com");
    const approveUrl = `${origin}/parent/approve?token=${parentToken}`;

    const result = await sendParentConsentEmail({
      athleteFirstName: firstName,
      athleteLastName: lastName,
      parentFirstName,
      parentEmail,
      approveUrl,
      fallbackCode: parentCode,
    });

    const status = result.skipped
      ? "skipped"
      : consentResultSent(result)
      ? "sent"
      : "failed";

    // Best-effort status write — if this fails the athlete still gets
    // the code on their dashboard, so we don't surface the error.
    await supabase
      .from("athletes")
      .update({ parent_approval_email_status: status })
      .eq("id", user.id);
  }

  revalidatePath("/", "layout");
  redirect("/signup/verify");
}
