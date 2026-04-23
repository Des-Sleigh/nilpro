import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TargetListManager,
  type TargetRowView,
} from "@/components/target-list/TargetListManager";

export const metadata: Metadata = {
  title: "Your target list — NILPro",
};

type BusinessLite = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  primary_category: string | null;
  google_rating: number | null;
  google_user_ratings_total: number | null;
  global_blacklisted: boolean;
};

type TargetRow = {
  id: string;
  business_id: string;
  status: string;
  source_category: string | null;
  businesses: BusinessLite | BusinessLite[] | null;
};

function pickBusiness(
  rel: BusinessLite | BusinessLite[] | null
): BusinessLite | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export default async function TargetListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/target-list");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!athlete) redirect("/signup/profile");

  const { data: raw } = await supabase
    .from("target_lists")
    .select(
      `id, business_id, status, source_category,
       businesses!inner(id, name, city, state, primary_category,
                        google_rating, google_user_ratings_total,
                        global_blacklisted)`
    )
    .eq("athlete_id", user.id)
    .in("status", ["approved", "pending", "removed"])
    .order("added_at", { ascending: true });

  const targets = (raw ?? []) as unknown as TargetRow[];

  const rows: TargetRowView[] = targets
    .map((t) => {
      const biz = pickBusiness(t.businesses);
      if (!biz || biz.global_blacklisted) return null;
      const status = t.status as TargetRowView["status"];
      if (!["approved", "pending", "removed"].includes(status)) return null;
      return {
        target_id: t.id,
        business_id: t.business_id,
        status,
        name: biz.name,
        category: t.source_category ?? biz.primary_category ?? "other",
        city: biz.city,
        state: biz.state,
        rating: biz.google_rating,
        ratings_count: biz.google_user_ratings_total,
      };
    })
    .filter((x): x is TargetRowView => x !== null);

  const params = await searchParams;

  return (
    <main className="section">
      <div className="container-page" style={{ maxWidth: "52rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="section-head" style={{ marginBottom: "2rem" }}>
          <span className="label">TARGET LIST</span>
          <h1 style={{ marginTop: "1rem" }}>
            Your full <span className="accent-green">target list.</span>
          </h1>
          <p className="lede" style={{ marginTop: "0.75rem" }}>
            Approve, remove, or skip any business. Skipped names get added to
            your permanent skip list so we never pitch them again.
          </p>
        </div>

        {params.error ? (
          <div
            role="alert"
            style={{
              marginBottom: "1.25rem",
              padding: "0.85rem 1rem",
              border: "1px solid var(--red)",
              background: "rgba(255, 58, 87, 0.08)",
              borderRadius: "var(--r-sm)",
              fontSize: "0.9rem",
              color: "var(--red)",
            }}
          >
            {params.error}
          </div>
        ) : null}

        <TargetListManager rows={rows} />
      </div>
    </main>
  );
}
