import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import { PhotoForm } from "@/components/auth/PhotoForm";

export const metadata: Metadata = {
  title: "Add your photo — NILPro",
};

export default async function PhotoStep() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup/create");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, profile_photo_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  // Prereq: social + deal-menu + approved target list.
  const { data: social } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();
  if (!social) redirect("/signup/verify");

  const { data: dealMenu } = await supabase
    .from("deal_menus")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();
  if (!dealMenu) redirect("/signup/deal-menu");

  const { data: approved } = await supabase
    .from("target_lists")
    .select("id")
    .eq("athlete_id", user.id)
    .eq("status", "approved")
    .limit(1);
  if (!approved || approved.length === 0) redirect("/signup/review");

  // Forward-skip if a photo already exists.
  if (athlete.profile_photo_url) {
    redirect("/signup/done");
  }

  return (
    <SignupShell
      step={7}
      eyebrow="ADD A FACE"
      title={
        <>
          Put a face <span className="accent-green">to the pitch.</span>
        </>
      }
    >
      <p className="lede" style={{ marginTop: "0.25rem" }}>
        Athletes with photos get higher reply rates. You can skip for now and
        add one later from settings.
      </p>
      <PhotoForm userId={user.id} />
    </SignupShell>
  );
}
