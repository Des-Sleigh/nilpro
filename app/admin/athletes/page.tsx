import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AthletesTable, type AthleteRow } from "@/components/admin/AthletesTable";

export const metadata: Metadata = {
  title: "Athletes — NILPro Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAthletesPage() {
  const sb = createAdminClient();

  const [{ data: athletes }, { data: socials }, usersRes] = await Promise.all([
    sb
      .from("athletes")
      .select(
        "id, first_name, last_name, level, sport, school, subscription_status, is_minor, parent_approved_at, created_at"
      )
      .order("created_at", { ascending: false }),
    sb.from("social_accounts").select("athlete_id, verified"),
    sb.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const verifiedSet = new Set(
    (socials ?? [])
      .filter((s) => s.verified)
      .map((s) => s.athlete_id as string)
  );
  const emailById = new Map<string, string | null>();
  for (const u of usersRes.data?.users ?? []) {
    emailById.set(u.id, u.email ?? null);
  }

  const rows: AthleteRow[] = (athletes ?? []).map((a) => ({
    id: a.id as string,
    first_name: a.first_name,
    last_name: a.last_name,
    email: emailById.get(a.id as string) ?? null,
    level: a.level,
    sport: a.sport,
    school: a.school,
    subscription_status:
      (a.subscription_status as string | null) ?? null,
    is_minor: Boolean(a.is_minor),
    parent_approved_at: (a.parent_approved_at as string | null) ?? null,
    verified: verifiedSet.has(a.id as string),
    created_at: (a.created_at as string | null) ?? null,
  }));

  return (
    <>
      <h1 className="admin-h1">
        Athletes <em>{rows.length}</em>
      </h1>
      <div
        className="admin-sub"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span>All signed-up athletes</span>
        <a
          href="/admin/athletes/export"
          download
          className="btn btn--ghost btn--sm"
        >
          Download all as CSV ↓
        </a>
      </div>

      <AthletesTable rows={rows} />
    </>
  );
}
