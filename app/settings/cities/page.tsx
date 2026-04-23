import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsCitiesForm } from "@/components/settings/SettingsCitiesForm";

export const metadata: Metadata = {
  title: "Edit pitch cities — NILPro",
};

export default async function SettingsCitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/settings/cities");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, business_categories")
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  const { data: pitchCities } = await supabase
    .from("pitch_cities")
    .select("city, state, radius_miles")
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: true });

  const defaultCities = (pitchCities ?? []).map((c) => ({
    city: c.city as string,
    state: c.state as string,
  }));

  const defaultRadius =
    typeof pitchCities?.[0]?.radius_miles === "number"
      ? (pitchCities[0].radius_miles as number)
      : 10;

  const defaultCategories =
    (athlete.business_categories as string[] | null) ?? [];

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
          <span className="label">PITCH CITIES</span>
          <h1 style={{ marginTop: "1rem" }}>
            Edit your <span className="accent-green">pitch cities.</span>
          </h1>
          <p className="lede" style={{ marginTop: "0.75rem" }}>
            Add, remove, or adjust radius. New combos trigger a fresh
            Google search — existing ones are cached.
          </p>
        </div>

        <SettingsCitiesForm
          defaultCities={defaultCities}
          defaultRadius={defaultRadius}
          defaultCategories={defaultCategories}
          error={params.error}
        />
      </div>
    </main>
  );
}
