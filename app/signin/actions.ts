"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Whitelist a `next` redirect target to a same-origin path.
 * Blocks open-redirect via `//evil.com/path`, `/\evil.com`, full URLs, etc.
 * Falls back to /dashboard for any unsafe input.
 */
function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  // Must start with `/` — but NOT `//` (protocol-relative) and NOT `/\` (Windows).
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return "/dashboard";
  }
  return next;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(String(formData.get("next") ?? "/dashboard"));

  if (!email || !password) {
    redirect(
      `/signin?error=${encodeURIComponent("Enter your email and password.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}
