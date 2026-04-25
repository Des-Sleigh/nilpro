import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Require the current request to come from an authenticated admin.
 * Redirects to /signin or /dashboard if not. Returns the user when ok.
 *
 * Note: the `admin_users` table from migration 0001 keys rows by `id`
 * (a uuid that references auth.users.id) — there is no `user_id` column.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/admin");

  const { data: row } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!row) redirect("/dashboard");
  return user;
}
