import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import { TargetsForm } from "@/components/auth/TargetsForm";

export const metadata: Metadata = {
  title: "Pitch targets — NILPro",
};

// Supabase stores state two-letter codes; our dropdown is also two-letter.
// We don't attempt to derive the school city here — `athletes.school` is a
// free-text school name (e.g. "Baylor University"), not a city. Phase 1
// just pre-fills the hometown and lets the athlete add more cities manually.

export default async function TargetsStep({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup/create");

  const { data: athlete } = await supabase
    .from("athletes")
    .select(
      "id, hometown_city, hometown_state, business_categories, school"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  const { data: social } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();

  if (!social) redirect("/signup/verify");

  // If deal_menus already exists, they finished signup — go to dashboard.
  const { data: dealMenu } = await supabase
    .from("deal_menus")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();

  if (dealMenu) redirect("/dashboard");

  // Pre-fill cities from existing pitch_cities rows if any; otherwise seed
  // with the hometown from the athlete record.
  const { data: existingCities } = await supabase
    .from("pitch_cities")
    .select("city, state, radius_miles")
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: true });

  let defaultCities: { city: string; state: string }[] = [];
  let defaultRadius = 10;
  if (existingCities && existingCities.length > 0) {
    defaultCities = existingCities.map((c) => ({ city: c.city, state: c.state }));
    defaultRadius = existingCities[0].radius_miles ?? 10;
  } else if (athlete.hometown_city && athlete.hometown_state) {
    defaultCities = [
      { city: athlete.hometown_city, state: athlete.hometown_state },
    ];
  }

  const defaultCategories: string[] =
    (athlete.business_categories as string[] | null) ?? [];

  const params = await searchParams;

  return (
    <SignupShell
      step={4}
      eyebrow="WHO WE PITCH"
      title={
        <>
          Where &amp; who <span className="accent-green">we pitch.</span>
        </>
      }
    >
      <p className="lede" style={{ marginTop: "0.25rem" }}>
        Pick the cities and categories you want us to reach out in. Your
        hometown is pre-added — edit, remove, or add more.
      </p>
      <TargetsForm
        defaultCities={defaultCities}
        defaultRadius={defaultRadius}
        defaultCategories={defaultCategories}
        error={params.error}
      />
    </SignupShell>
  );
}
