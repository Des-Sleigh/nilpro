"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_LEVELS = new Set(["HS", "College", "Parent", "Coach", "Business"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(msg: string): never {
  redirect(`/waitlist?error=${encodeURIComponent(msg)}`);
}

function cap(raw: string | null | undefined, maxLen: number): string {
  if (!raw) return "";
  const cleaned = String(raw).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

export async function joinWaitlistAction(formData: FormData): Promise<void> {
  const email = cap(
    String(formData.get("email") ?? "").trim().toLowerCase(),
    256
  );
  const firstName = cap(String(formData.get("first_name") ?? "").trim(), 80);
  const state = cap(
    String(formData.get("state") ?? "").trim().toUpperCase(),
    2
  );
  const levelRaw = cap(String(formData.get("level") ?? "").trim(), 20);
  const level = VALID_LEVELS.has(levelRaw) ? levelRaw : null;
  const source = cap(String(formData.get("source") ?? "").trim(), 120);

  if (!email || !EMAIL_RE.test(email)) {
    fail("Enter a valid email address.");
  }

  // Hash the IP for soft rate-limiting/dedup without storing PII raw.
  const hdrs = await headers();
  const ipRaw =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const ipHash = crypto.createHash("sha256").update(ipRaw).digest("hex").slice(0, 32);
  const userAgent = cap(hdrs.get("user-agent") ?? "", 256);

  const sb = createAdminClient();
  const { error } = await sb.from("waitlist_signups").insert({
    email,
    first_name: firstName || null,
    state: state || null,
    level,
    source: source || null,
    ip_hash: ipHash,
    user_agent: userAgent || null,
  });

  if (error) {
    // Unique-violation on email = already on the list, that's fine.
    if (error.code === "23505") {
      redirect("/waitlist?already=1");
    }
    console.error(`[waitlist] db error:`, error.message);
    fail("Couldn't save — try again in a moment.");
  }

  redirect("/waitlist?joined=1");
}
