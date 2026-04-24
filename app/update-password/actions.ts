"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  if (!password || password.length < 8) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "Use at least 8 characters."
      )}`
    );
  }
  if (password !== confirm) {
    redirect(
      `/update-password?error=${encodeURIComponent("Passwords don't match.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(
      `/update-password?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
