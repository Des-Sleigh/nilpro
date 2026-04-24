"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendResetEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Enter your email.")}`
    );
  }

  const supabase = await createClient();
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? "https://thenilpro.com";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  // Don't leak whether the email exists. Always show the "check your
  // inbox" confirmation — Supabase silently no-ops for unknown emails,
  // so this is safe.
  if (error && !error.message.toLowerCase().includes("user not found")) {
    console.error("[reset-password]", error.message);
  }

  redirect(
    `/reset-password?sent=1&email=${encodeURIComponent(email)}`
  );
}
