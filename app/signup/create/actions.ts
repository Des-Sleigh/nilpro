"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const referralCode = String(formData.get("ref") ?? "").trim() || null;

  if (!email || !password) {
    redirect(
      `/signup/create?error=${encodeURIComponent("Enter your email and password.")}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/signup/create?error=${encodeURIComponent(
        "Use at least 8 characters for your password."
      )}`
    );
  }

  if (password !== passwordConfirm) {
    redirect(
      `/signup/create?error=${encodeURIComponent("Passwords don't match.")}`
    );
  }

  const supabase = await createClient();
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? "https://thenilpro.com";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/signup/profile`,
      data: referralCode ? { referred_by_code: referralCode } : {},
    },
  });

  if (error) {
    redirect(`/signup/create?error=${encodeURIComponent(error.message)}`);
  }

  // If the user already has a session (email confirmation disabled in
  // Supabase settings), go straight to the profile step. Otherwise route
  // them to the "check your email" page.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/signup/profile");
  }

  redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
}
