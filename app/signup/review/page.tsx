import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupShell } from "@/components/auth/SignupShell";
import {
  TargetReviewList,
  type ReviewBusiness,
} from "@/components/auth/TargetReviewList";

export const metadata: Metadata = {
  title: "Review targets — NILPro",
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

// Supabase-js's type inference for nested selects sometimes returns the
// embedded table as `BusinessLite | BusinessLite[] | null` depending on
// whether the FK is considered one-to-one. Normalize both shapes.
type TargetRow = {
  id: string;
  business_id: string;
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

export default async function ReviewStep({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup/create");

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, blacklist_terms")
    .eq("id", user.id)
    .maybeSingle();
  if (!athlete) redirect("/signup/profile");

  const { data: social } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();
  if (!social) redirect("/signup/verify");

  // New flow: deal-menu must be completed before targets, and targets
  // before review. No forward skip — review is always visitable during
  // signup until the photo step lands.
  const { data: dealMenu } = await supabase
    .from("deal_menus")
    .select("id")
    .eq("athlete_id", user.id)
    .maybeSingle();
  if (!dealMenu) redirect("/signup/deal-menu");

  const { data: cities } = await supabase
    .from("pitch_cities")
    .select("id")
    .eq("athlete_id", user.id)
    .limit(1);
  if (!cities || cities.length === 0) redirect("/signup/targets");

  const { data: targetsRaw } = await supabase
    .from("target_lists")
    .select(
      `id, business_id, source_category,
       businesses!inner(id, name, city, state, primary_category,
                        google_rating, google_user_ratings_total,
                        global_blacklisted)`
    )
    .eq("athlete_id", user.id)
    .eq("status", "pending")
    .order("added_at", { ascending: true });

  const targets = (targetsRaw ?? []) as unknown as TargetRow[];

  const businesses: ReviewBusiness[] = targets
    .map((t) => {
      const biz = pickBusiness(t.businesses);
      if (!biz || biz.global_blacklisted) return null;
      return {
        target_id: t.id,
        business_id: t.business_id,
        name: biz.name,
        category: t.source_category ?? biz.primary_category ?? "other",
        city: biz.city,
        state: biz.state,
        rating: biz.google_rating,
        ratings_count: biz.google_user_ratings_total,
      };
    })
    .filter((x): x is ReviewBusiness => x !== null);

  const initialBlacklistTerms = Array.isArray(athlete.blacklist_terms)
    ? (athlete.blacklist_terms as string[])
    : [];

  const params = await searchParams;

  return (
    <SignupShell
      step={6}
      eyebrow="YOUR LIST"
      title={
        <>
          Your <span className="accent-green">target list.</span>
        </>
      }
    >
      {params.error ? (
        <div
          role="alert"
          style={{
            marginTop: "1rem",
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

      {businesses.length === 0 ? (
        <EmptyReview />
      ) : (
        <>
          <p className="lede" style={{ marginTop: "0.25rem" }}>
            We found{" "}
            <strong style={{ color: "var(--text)" }}>{businesses.length}</strong>{" "}
            businesses in your area. Uncheck any you don&apos;t want to pitch,
            or tell us below which ones to always skip.
          </p>
          <TargetReviewList
            businesses={businesses}
            initialBlacklistTerms={initialBlacklistTerms}
          />
        </>
      )}
    </SignupShell>
  );
}

function EmptyReview() {
  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "2rem 1.5rem",
        border: "1px dashed var(--border-strong)",
        background: "var(--bg-soft)",
        borderRadius: "var(--r-md)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gold)",
          fontWeight: 700,
          marginBottom: "0.75rem",
        }}
      >
        ● NO RESULTS YET
      </div>
      <p
        style={{
          fontSize: "0.95rem",
          color: "var(--text-dim)",
          margin: "0 0 1.25rem 0",
          lineHeight: 1.55,
        }}
      >
        We couldn&apos;t find businesses for your locations and categories. Try
        adding another location or picking different categories.
      </p>
      <Link href="/signup/targets" className="btn btn--primary">
        Back to locations
      </Link>
    </div>
  );
}
