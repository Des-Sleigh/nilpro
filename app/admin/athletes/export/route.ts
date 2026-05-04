/**
 * GET /admin/athletes/export
 *
 * Admin-only CSV export of every athlete in the system, joined with
 * social_accounts (platform/handle/verified) so you have everything you
 * need for outreach lists, marketing imports, and ad-hoc spreadsheet work.
 *
 * Auth: requireAdmin() — non-admins get redirected.
 *
 * The user's auth.users.email isn't on the athletes row directly, so we
 * fetch it via auth.admin.listUsers() and merge in-memory. This is a
 * one-shot admin operation, paginated to handle >1000 athletes.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function esc(v: string | number | boolean | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function formatArr(v: unknown): string {
  if (!Array.isArray(v)) return "";
  return v.filter((x) => x != null && x !== "").join("; ");
}

export async function GET() {
  await requireAdmin();

  const sb = createAdminClient();

  // 1. Pull every athlete row.
  const { data: athletes, error: athleteErr } = await sb
    .from("athletes")
    .select(
      "id, member_id, first_name, last_name, sport, sports, position, level, school, graduation_year, hometown_city, hometown_state, is_minor, parent_first_name, parent_email, parent_approved_at, hs_state_restricted, subscription_tier, subscription_status, profile_photo_url, referral_code, created_at"
    )
    .order("created_at", { ascending: true });

  if (athleteErr) {
    console.error("[admin/athletes/export] athletes query failed:", athleteErr.message);
    return new NextResponse(`Export failed: ${athleteErr.message}`, {
      status: 500,
    });
  }

  // 2. Pull every social_accounts row in one shot, key by athlete_id.
  const { data: socials } = await sb
    .from("social_accounts")
    .select("athlete_id, platform, handle, verified");
  const socialByAthlete = new Map<
    string,
    { platform: string | null; handle: string | null; verified: boolean }
  >();
  for (const s of socials ?? []) {
    socialByAthlete.set(s.athlete_id as string, {
      platform: (s.platform as string | null) ?? null,
      handle: (s.handle as string | null) ?? null,
      verified: Boolean(s.verified),
    });
  }

  // 3. Pull each athlete's auth email. listUsers() paginates at 50/page;
  // we only need email + id, so it's a thin payload.
  const emailById = new Map<string, string>();
  let page = 1;
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      console.error("[admin/athletes/export] listUsers failed:", error.message);
      break;
    }
    for (const u of data?.users ?? []) {
      if (u.email) emailById.set(u.id, u.email);
    }
    if (!data || data.users.length < 1000) break;
    page += 1;
  }

  // 4. Compose CSV.
  const headers = [
    "member_id",
    "athlete_email",
    "first_name",
    "last_name",
    "school",
    "level",
    "sport",
    "all_sports",
    "position",
    "graduation_year",
    "hometown_city",
    "hometown_state",
    "is_minor",
    "parent_first_name",
    "parent_email",
    "parent_approved_at",
    "ig_handle",
    "ig_verified",
    "subscription_tier",
    "subscription_status",
    "hs_state_restricted",
    "referral_code",
    "created_at",
    "athlete_id",
  ];
  const lines = [headers.join(",")];

  for (const a of athletes ?? []) {
    const social = socialByAthlete.get(a.id as string);
    const email = emailById.get(a.id as string) ?? "";
    lines.push(
      [
        esc(a.member_id as string | null),
        esc(email),
        esc(a.first_name as string),
        esc(a.last_name as string),
        esc(a.school as string),
        esc(a.level as string),
        esc(a.sport as string),
        esc(formatArr(a.sports)),
        esc(a.position as string | null),
        esc(a.graduation_year as number | null),
        esc(a.hometown_city as string | null),
        esc(a.hometown_state as string | null),
        esc(a.is_minor as boolean | null),
        esc(a.parent_first_name as string | null),
        esc(a.parent_email as string | null),
        esc(a.parent_approved_at as string | null),
        esc(social?.handle ?? null),
        esc(social?.verified ?? null),
        esc(a.subscription_tier as string | null),
        esc(a.subscription_status as string | null),
        esc(a.hs_state_restricted as boolean | null),
        esc(a.referral_code as string | null),
        esc(a.created_at as string | null),
        esc(a.id as string),
      ].join(",")
    );
  }

  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nilpro-athletes-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
