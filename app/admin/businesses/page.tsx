import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BusinessesTable,
  type BusinessRow,
} from "@/components/admin/BusinessesTable";

export const metadata: Metadata = {
  title: "Businesses — NILPro Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const sb = createAdminClient();

  const [{ data: businesses }, { data: targets }] = await Promise.all([
    sb
      .from("businesses")
      .select(
        "id, name, city, state, primary_category, email, phone, google_rating, global_blacklisted, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(2000),
    sb.from("target_lists").select("business_id, athlete_id"),
  ]);

  // Build athlete-count map: distinct athletes per business.
  const counts = new Map<string, Set<string>>();
  for (const t of targets ?? []) {
    const bid = t.business_id as string;
    const aid = t.athlete_id as string;
    if (!counts.has(bid)) counts.set(bid, new Set());
    counts.get(bid)!.add(aid);
  }

  const rows: BusinessRow[] = (businesses ?? []).map((b) => ({
    id: b.id as string,
    name: b.name,
    city: (b.city as string | null) ?? null,
    state: (b.state as string | null) ?? null,
    primary_category: (b.primary_category as string | null) ?? null,
    email: (b.email as string | null) ?? null,
    phone: (b.phone as string | null) ?? null,
    google_rating: (b.google_rating as number | null) ?? null,
    global_blacklisted: Boolean(b.global_blacklisted),
    athlete_count: counts.get(b.id as string)?.size ?? 0,
    created_at: (b.created_at as string | null) ?? null,
  }));

  // Default sort: missing-email first, then most recent.
  rows.sort((a, b) => {
    const aMissing = a.email ? 0 : 1;
    const bMissing = b.email ? 0 : 1;
    if (aMissing !== bMissing) return bMissing - aMissing;
    const at = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bt - at;
  });

  return (
    <>
      <h1 className="admin-h1">
        Businesses <em>{rows.length}</em>
      </h1>
      <div className="admin-sub">Cached from Google Places + manual edits</div>
      <BusinessesTable rows={rows} />
    </>
  );
}
