import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function esc(v: string | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id: athleteId } = await ctx.params;

  const sb = createAdminClient();
  const { data: athleteRow } = await sb
    .from("athletes")
    .select("first_name, last_name")
    .eq("id", athleteId)
    .maybeSingle();

  const { data: rows } = await sb
    .from("target_lists")
    .select(
      "source_category, businesses(name, formatted_address, city, state, phone, website, email)"
    )
    .eq("athlete_id", athleteId)
    .eq("status", "approved");

  type BizRel = {
    name: string;
    formatted_address: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    website: string | null;
    email: string | null;
  };
  type RawRow = {
    source_category: string | null;
    businesses: BizRel | BizRel[] | null;
  };
  const cleaned = ((rows ?? []) as unknown as RawRow[]).map((r) => ({
    source_category: r.source_category,
    businesses: Array.isArray(r.businesses)
      ? r.businesses[0] ?? null
      : r.businesses,
  }));

  const headers = [
    "business_name",
    "address",
    "city",
    "state",
    "phone",
    "website",
    "email",
    "source_category",
  ];

  const lines = [headers.join(",")];
  for (const r of cleaned) {
    if (!r.businesses) continue;
    lines.push(
      [
        esc(r.businesses.name),
        esc(r.businesses.formatted_address),
        esc(r.businesses.city),
        esc(r.businesses.state),
        esc(r.businesses.phone),
        esc(r.businesses.website),
        esc(r.businesses.email),
        esc(r.source_category),
      ].join(",")
    );
  }

  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = athleteRow
    ? `${athleteRow.first_name}-${athleteRow.last_name}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : athleteId;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="target-list-${slug}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
