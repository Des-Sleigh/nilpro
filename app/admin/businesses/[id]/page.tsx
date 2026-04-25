import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { editBusinessAction, toggleGlobalBlacklistAction } from "./actions";

export const metadata: Metadata = {
  title: "Business detail — NILPro Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: businessId } = await params;
  const sb = createAdminClient();

  const [bizRes, targetsRes, pitchesRes] = await Promise.all([
    sb.from("businesses").select("*").eq("id", businessId).maybeSingle(),
    sb
      .from("target_lists")
      .select(
        "id, status, athlete_id, athletes(first_name, last_name)"
      )
      .eq("business_id", businessId),
    sb
      .from("pitches")
      .select(
        "id, status, sent_at, athlete_id, athletes(first_name, last_name)"
      )
      .eq("business_id", businessId)
      .order("sent_at", { ascending: false }),
  ]);

  const biz = bizRes.data;
  if (!biz) notFound();

  type AthleteMini = { first_name: string; last_name: string };
  type TargetRaw = {
    id: string;
    status: string;
    athlete_id: string;
    athletes: AthleteMini | AthleteMini[] | null;
  };
  const targets = ((targetsRes.data ?? []) as unknown as TargetRaw[]).map(
    (t) => ({
      ...t,
      athletes: Array.isArray(t.athletes)
        ? t.athletes[0] ?? null
        : t.athletes,
    })
  );

  type PitchRaw = {
    id: string;
    status: string;
    sent_at: string | null;
    athlete_id: string;
    athletes: AthleteMini | AthleteMini[] | null;
  };
  const pitches = ((pitchesRes.data ?? []) as unknown as PitchRaw[]).map(
    (p) => ({
      ...p,
      athletes: Array.isArray(p.athletes)
        ? p.athletes[0] ?? null
        : p.athletes,
    })
  );

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/admin/businesses"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          ← All businesses
        </Link>
      </div>

      <h1 className="admin-h1">{biz.name}</h1>
      <div className="admin-sub">
        {biz.city ?? "—"}
        {biz.state ? `, ${biz.state}` : ""} · {biz.primary_category ?? "—"}
      </div>

      <div className="admin-grid-2">
        <div className="admin-detail-card">
          <h2>Edit contact</h2>
          <form action={editBusinessAction} className="admin-form">
            <input type="hidden" name="business_id" value={businessId} />
            <div>
              <label className="admin-label">Email</label>
              <input
                className="admin-input"
                type="email"
                name="email"
                defaultValue={(biz.email as string | null) ?? ""}
                placeholder="contact@business.com"
              />
            </div>
            <div>
              <label className="admin-label">Phone</label>
              <input
                className="admin-input"
                type="tel"
                name="phone"
                defaultValue={(biz.phone as string | null) ?? ""}
              />
            </div>
            <div>
              <label className="admin-label">Website</label>
              <input
                className="admin-input"
                type="url"
                name="website"
                defaultValue={(biz.website as string | null) ?? ""}
              />
            </div>
            <div>
              <button type="submit" className="admin-btn admin-btn--gold">
                Save changes
              </button>
            </div>
          </form>
        </div>

        <div className="admin-detail-card">
          <h2>Global blacklist</h2>
          <form action={toggleGlobalBlacklistAction} className="admin-form">
            <input type="hidden" name="business_id" value={businessId} />
            <label
              style={{
                display: "flex",
                gap: "0.55rem",
                alignItems: "center",
                color: "var(--text)",
              }}
            >
              <input
                type="checkbox"
                name="blacklisted"
                defaultChecked={Boolean(biz.global_blacklisted)}
              />
              <span>Globally blacklisted (no athlete can pitch this)</span>
            </label>
            <div>
              <label className="admin-label">Reason</label>
              <textarea
                className="admin-textarea"
                name="reason"
                placeholder="e.g. competitor, requested removal, low quality..."
                defaultValue={(biz.blacklisted_reason as string | null) ?? ""}
              />
            </div>
            <div>
              <button type="submit" className="admin-btn admin-btn--gold">
                Save blacklist state
              </button>
            </div>
          </form>

          <div style={{ marginTop: "1.25rem" }}>
            <span className="admin-label">Other info</span>
            <dl className="admin-kv">
              <dt>Address</dt>
              <dd>{(biz.formatted_address as string | null) ?? "—"}</dd>
              <dt>Google rating</dt>
              <dd>
                {biz.google_rating ?? "—"}
                {biz.google_user_ratings_total
                  ? ` (${biz.google_user_ratings_total})`
                  : ""}
              </dd>
              <dt>Place ID</dt>
              <dd
                style={{ fontFamily: "var(--mono)", fontSize: "0.75rem" }}
              >
                {(biz.google_place_id as string | null) ?? "—"}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Athletes pitching this */}
      <div className="admin-section-head">
        <h3>Athletes targeting</h3>
        <span className="admin-panel__count">{targets.length}</span>
      </div>
      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {targets.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ No athletes have this on their target list
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/admin/athletes/${t.athlete_id}`}>
                        {t.athletes
                          ? `${t.athletes.first_name} ${t.athletes.last_name}`
                          : "—"}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={
                          "admin-pill-tag" +
                          (t.status === "approved"
                            ? " admin-pill-tag--green"
                            : " admin-pill-tag--blue")
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Pitches sent to this */}
      <div className="admin-section-head">
        <h3>Pitches sent here</h3>
        <span className="admin-panel__count">{pitches.length}</span>
      </div>
      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {pitches.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ No pitches yet
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Status</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/athletes/${p.athlete_id}`}>
                        {p.athletes
                          ? `${p.athletes.first_name} ${p.athletes.last_name}`
                          : "—"}
                      </Link>
                    </td>
                    <td>
                      <span className="admin-pill-tag">{p.status}</span>
                    </td>
                    <td>
                      {p.sent_at
                        ? new Date(p.sent_at).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
