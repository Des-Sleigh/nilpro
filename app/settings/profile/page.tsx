import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  SettingsProfileForm,
  type SettingsProfileDefaults,
} from "@/components/settings/SettingsProfileForm";

export const metadata: Metadata = {
  title: "Edit profile — NILPro",
};

export default async function SettingsProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/settings/profile");

  const { data: athlete } = await supabase
    .from("athletes")
    .select(
      "first_name, last_name, sport, position, sports, positions, level, school, graduation_year, hometown_city, hometown_state, profile_photo_url"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  const { data: socials } = await supabase
    .from("social_accounts")
    .select("platform, handle")
    .eq("athlete_id", user.id);

  const ig = socials?.find((s) => s.platform === "instagram") ?? null;
  const tiktok = socials?.find((s) => s.platform === "tiktok") ?? null;

  const defaults: SettingsProfileDefaults = {
    firstName: athlete.first_name,
    lastName: athlete.last_name,
    level: athlete.level,
    sport: athlete.sport,
    position: athlete.position ?? null,
    sports: Array.isArray(athlete.sports)
      ? (athlete.sports as string[])
      : null,
    positions: Array.isArray(athlete.positions)
      ? (athlete.positions as string[])
      : null,
    school: athlete.school,
    graduationYear:
      typeof athlete.graduation_year === "number"
        ? athlete.graduation_year
        : null,
    hometownCity: athlete.hometown_city ?? null,
    hometownState: athlete.hometown_state ?? null,
    instagramHandle: ig?.handle ?? "",
    tiktokHandle: tiktok?.handle ?? "",
    profilePhotoUrl: athlete.profile_photo_url ?? null,
    userId: user.id,
  };

  const params = await searchParams;

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "44rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            ← Back to dashboard
          </Link>
        </div>
        <div className="section-head" style={{ marginBottom: "2rem" }}>
          <span className="label">PROFILE</span>
          <h1 style={{ marginTop: "1rem" }}>
            Edit your <span className="accent-green">profile.</span>
          </h1>
        </div>
        <SettingsProfileForm
          defaults={defaults}
          error={params.error}
          saved={params.saved === "1"}
        />
      </div>
    </main>
  );
}
