"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

function refresh(businessId: string) {
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/queue");
}

export async function editBusinessAction(formData: FormData) {
  await requireAdmin();
  const businessId = String(formData.get("business_id") ?? "");
  if (!businessId) return;

  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const website = String(formData.get("website") ?? "").trim() || null;

  const sb = createAdminClient();
  await sb
    .from("businesses")
    .update({ email, phone, website })
    .eq("id", businessId);

  refresh(businessId);
}

export async function toggleGlobalBlacklistAction(formData: FormData) {
  await requireAdmin();
  const businessId = String(formData.get("business_id") ?? "");
  if (!businessId) return;

  const blacklisted = formData.get("blacklisted") === "on";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const sb = createAdminClient();
  await sb
    .from("businesses")
    .update({
      global_blacklisted: blacklisted,
      blacklisted_reason: blacklisted ? reason : null,
    })
    .eq("id", businessId);

  refresh(businessId);
}
