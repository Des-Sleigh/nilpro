import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin overview — NILPro",
};

export const dynamic = "force-dynamic";

function timeAgo(ts: string | null): string {
  if (!ts) return "—";
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return "—";
  const secs = Math.floor((Date.now() - t) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function AdminOverviewPage() {
  const sb = createAdminClient();

  // Pull aggregates in parallel.
  const [
    athletesAllRes,
    socialsRes,
    targetListsRes,
    pitchesAllRes,
    recentSignupsRes,
    recentPitchesRes,
  ] = await Promise.all([
    sb
      .from("athletes")
      .select(
        "id, first_name, last_name, subscription_status, is_minor, parent_approved_at, created_at"
      ),
    sb.from("social_accounts").select("athlete_id, verified"),
    sb.from("target_lists").select("status"),
    sb
      .from("pitches")
      .select("id, status, sent_at, athlete_id, business_id")
      .order("sent_at", { ascending: false })
      .limit(500),
    sb
      .from("athletes")
      .select(
        "id, first_name, last_name, level, sport, school, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10),
    sb
      .from("pitches")
      .select(
        "id, status, sent_at, athlete_id, business_id, athletes(first_name,last_name), businesses(name)"
      )
      .order("sent_at", { ascending: false })
      .limit(10),
  ]);

  const athletes = athletesAllRes.data ?? [];
  const socials = socialsRes.data ?? [];
  const targetLists = targetListsRes.data ?? [];
  const pitches = pitchesAllRes.data ?? [];

  const totalAthletes = athletes.length;
  const paidAthletes = athletes.filter(
    (a) => a.subscription_status === "active"
  ).length;
  const verifiedSet = new Set(
    socials.filter((s) => s.verified).map((s) => s.athlete_id as string)
  );
  const awaitingVerification = athletes.filter(
    (a) => !verifiedSet.has(a.id as string)
  ).length;
  const awaitingParent = athletes.filter(
    (a) => a.is_minor && !a.parent_approved_at
  ).length;

  const approvedTargets = targetLists.filter(
    (t) => t.status === "approved"
  ).length;
  const pendingTargets = targetLists.filter(
    (t) => t.status === "pending"
  ).length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const pitchesSent7d = pitches.filter((p) => {
    if (!p.sent_at) return false;
    return new Date(p.sent_at).getTime() >= sevenDaysAgo;
  }).length;
  const repliesAwaitingRouting = pitches.filter((p) =>
    String(p.status ?? "").startsWith("replied_")
  ).length;

  const recentSignups = recentSignupsRes.data ?? [];
  type AthleteMini = { first_name: string; last_name: string };
  type BizMini = { name: string };
  type RecentPitchRaw = {
    id: string;
    status: string;
    sent_at: string | null;
    athlete_id: string;
    business_id: string;
    athletes: AthleteMini | AthleteMini[] | null;
    businesses: BizMini | BizMini[] | null;
  };
  const recentPitches = (
    (recentPitchesRes.data ?? []) as unknown as RecentPitchRaw[]
  ).map((p) => ({
    ...p,
    athletes: Array.isArray(p.athletes)
      ? p.athletes[0] ?? null
      : p.athletes,
    businesses: Array.isArray(p.businesses)
      ? p.businesses[0] ?? null
      : p.businesses,
  }));

  return (
    <>
      <h1 className="admin-h1">
        Founder <em>console</em>
      </h1>
      <div className="admin-sub">Operating dashboard — internal only</div>

      <div className="admin-cards">
        <div className="admin-card">
          <div className="admin-card__label">Total athletes</div>
          <div className="admin-card__num">{totalAthletes}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Paid</div>
          <div className="admin-card__num admin-card__num--gold">
            {paidAthletes}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Awaiting verification</div>
          <div className="admin-card__num admin-card__num--blue">
            {awaitingVerification}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Awaiting parent approval</div>
          <div className="admin-card__num admin-card__num--blue">
            {awaitingParent}
          </div>
        </div>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <div className="admin-card__label">Approved target rows</div>
          <div className="admin-card__num">{approvedTargets}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Pending review</div>
          <div className="admin-card__num admin-card__num--blue">
            {pendingTargets}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Pitches sent (7d)</div>
          <div className="admin-card__num admin-card__num--gold">
            {pitchesSent7d}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card__label">Replies awaiting routing</div>
          <div className="admin-card__num admin-card__num--red">
            {repliesAwaitingRouting}
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div className="admin-panel__title">Recent signups</div>
            <Link href="/admin/athletes" className="admin-panel__count">
              View all →
            </Link>
          </div>
          <div className="admin-panel__body admin-panel__body--flush">
            {recentSignups.length === 0 ? (
              <div className="admin-empty" style={{ padding: "1rem" }}>
                ✓ Nothing here
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Level / Sport</th>
                    <th>School</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((a) => (
                    <tr key={a.id as string}>
                      <td>
                        <Link href={`/admin/athletes/${a.id}`}>
                          {a.first_name} {a.last_name}
                        </Link>
                      </td>
                      <td>
                        {a.level} · {a.sport}
                      </td>
                      <td>{a.school}</td>
                      <td>{timeAgo(a.created_at as string | null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <div className="admin-panel__title">Recent pitches</div>
            <Link href="/admin/pitches" className="admin-panel__count">
              View all →
            </Link>
          </div>
          <div className="admin-panel__body admin-panel__body--flush">
            {recentPitches.length === 0 ? (
              <div className="admin-empty" style={{ padding: "1rem" }}>
                ✓ Nothing here
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Athlete</th>
                    <th>Business</th>
                    <th>Status</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPitches.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/admin/athletes/${p.athlete_id}`}>
                          {p.athletes
                            ? `${p.athletes.first_name} ${p.athletes.last_name}`
                            : "—"}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/admin/businesses/${p.business_id}`}>
                          {p.businesses?.name ?? "—"}
                        </Link>
                      </td>
                      <td>
                        <span className="admin-pill-tag">{p.status}</span>
                      </td>
                      <td>{timeAgo(p.sent_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
