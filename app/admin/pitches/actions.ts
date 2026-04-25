"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = [
  "queued",
  "sent",
  "opened",
  "replied_yes",
  "replied_counter",
  "replied_no",
  "unsubscribed",
  "no_response",
  "bounced",
] as const;

export async function setPitchStatusAction(formData: FormData) {
  await requireAdmin();
  const pitchId = String(formData.get("pitch_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const responseText = String(formData.get("response_text") ?? "").trim() || null;
  if (!pitchId) return;
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return;
  }

  const sb = createAdminClient();
  const updates: Record<string, unknown> = { status };
  if (status.startsWith("replied_")) {
    updates.responded_at = new Date().toISOString();
    if (responseText) updates.response_text = responseText;
  }
  await sb.from("pitches").update(updates).eq("id", pitchId);

  revalidatePath("/admin/pitches");
  revalidatePath("/admin");
  revalidatePath("/admin/queue");
}
