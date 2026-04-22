import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const metadata: Metadata = {
  title: "Profile basics — NILPro",
};

export default async function ProfileStep({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup/create");
  }

  // Already completed profile? Skip ahead.
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (athlete) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <SignupShell
      step={2}
      eyebrow="PROFILE BASICS"
      title={
        <>
          Tell us <span className="accent-green">who you are.</span>
        </>
      }
    >
      <ProfileForm error={params.error} />
    </SignupShell>
  );
}
