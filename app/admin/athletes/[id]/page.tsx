import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LogPitchRow } from "@/components/admin/LogPitchRow";
import {
  verifyAthleteAction,
  unverifyAthleteAction,
  approveParentAction,
  revokeParentAction,
  adminResendParentConsentAction,
  setSubscriptionAction,
  saveAthleteNotesAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Athlete detail — NILPro Admin",
};

export const dynamic = "force-dynamic";

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export default async function AdminAthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: athleteId } = await params;
  const sb = createAdminClient();

  const [athleteRes, socialRes, dealRes, citiesRes, targetsRes, pitchesRes, userRes] =
    await Promise.all([
      sb.from("athletes").select("*").eq("id", athleteId).maybeSingle(),
      sb
        .from("social_accounts")
        .select("*")
        .eq("athlete_id", athleteId)
        .eq("platform", "instagram")
        .maybeSingle(),
      sb
        .from("deal_menus")
        .select("*")
        .eq("athlete_id", athleteId)
        .maybeSingle(),
      sb
        .from("pitch_cities")
        .select("city, state, radius_miles")
        .eq("athlete_id", athleteId),
      sb
        .from("target_lists")
        .select(
          "id, status, source_category, source_city, businesses(id, name, city, state, email, phone, website)"
        )
        .eq("athlete_id", athleteId)
        .in("status", ["approved", "pending"])
        .order("status", { ascending: true }),
      sb
        .from("pitches")
        .select(
          "id, status, sent_at, responded_at, response_text, businesses(name)"
        )
        .eq("athlete_id", athleteId)
        .order("sent_at", { ascending: false }),
      sb.auth.admin.getUserById(athleteId),
    ]);

  const athlete = athleteRes.data;
  if (!athlete) notFound();

  const social = socialRes.data;
  const deal = dealRes.data;
  const cities = citiesRes.data ?? [];

  type BizMini = {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
  };
  type TargetRaw = {
    id: string;
    status: string;
    source_category: string | null;
    source_city: string | null;
    businesses: BizMini | BizMini[] | null;
  };
  const targets = ((targetsRes.data ?? []) as unknown as TargetRaw[]).map(
    (t) => ({
      ...t,
      businesses: Array.isArray(t.businesses)
        ? t.businesses[0] ?? null
        : t.businesses,
    })
  );

  type PitchRaw = {
    id: string;
    status: string;
    sent_at: string | null;
    responded_at: string | null;
    response_text: string | null;
    businesses: { name: string } | { name: string }[] | null;
  };
  const pitches = ((pitchesRes.data ?? []) as unknown as PitchRaw[]).map(
    (p) => ({
      ...p,
      businesses: Array.isArray(p.businesses)
        ? p.businesses[0] ?? null
        : p.businesses,
    })
  );
  const email = userRes.data?.user?.email ?? "—";

  const isVerified = Boolean(social?.verified);
  const age = ageFromDob(athlete.date_of_birth as string | null);

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/admin/athletes"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          ← All athletes
        </Link>
      </div>

      <h1 className="admin-h1">
        {athlete.first_name} <em>{athlete.last_name}</em>
      </h1>
      <div className="admin-sub">
        {athlete.level} ·{" "}
        {Array.isArray(athlete.sports) && athlete.sports.length > 0
          ? (athlete.sports as string[]).join(" · ")
          : athlete.sport}
        {" "}· {athlete.school}
      </div>

      <div className="admin-grid-2">
        {/* LEFT: identity card */}
        <div className="admin-detail-card">
          <h2>Identity</h2>
          <dl className="admin-kv">
            <dt>Email</dt>
            <dd style={{ fontFamily: "var(--mono)", fontSize: "0.82rem" }}>
              {email}
            </dd>
            <dt>Hometown</dt>
            <dd>
              {athlete.hometown_city ?? "—"}
              {athlete.hometown_state ? `, ${athlete.hometown_state}` : ""}
            </dd>
            <dt>DOB</dt>
            <dd>
              {(athlete.date_of_birth as string | null) ?? "—"}
              {age != null ? ` (age ${age})` : ""}
            </dd>
            <dt>Grad year</dt>
            <dd>{(athlete.graduation_year as number | null) ?? "—"}</dd>
            <dt>Position</dt>
            <dd>
              {Array.isArray(athlete.positions) &&
              (athlete.positions as string[]).filter((p) => p && p.length > 0)
                .length > 0
                ? (athlete.positions as string[])
                    .filter((p) => p && p.length > 0)
                    .join(" · ")
                : (athlete.position as string | null) ?? "—"}
            </dd>
            <dt>Referral code</dt>
            <dd style={{ fontFamily: "var(--mono)" }}>
              {(athlete.referral_code as string | null) ?? "—"}
            </dd>
            <dt>Referred by</dt>
            <dd style={{ fontFamily: "var(--mono)" }}>
              {(athlete.referred_by_code as string | null) ?? "—"}
            </dd>
            <dt>Subscription</dt>
            <dd>
              <span
                className={
                  "admin-pill-tag" +
                  (athlete.subscription_status === "active"
                    ? " admin-pill-tag--gold"
                    : "")
                }
              >
                {(athlete.subscription_status as string | null) ?? "free"}
                {athlete.subscription_tier
                  ? ` · ${athlete.subscription_tier}`
                  : ""}
              </span>
            </dd>
            <dt>IG verified</dt>
            <dd>
              <span
                className={
                  "admin-pill-tag" +
                  (isVerified
                    ? " admin-pill-tag--green"
                    : " admin-pill-tag--blue")
                }
              >
                {isVerified ? "Y" : "N"}
              </span>
              {social?.handle ? (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    fontFamily: "var(--mono)",
                    fontSize: "0.78rem",
                  }}
                >
                  @{social.handle}
                </span>
              ) : null}
            </dd>
            {athlete.is_minor ? (
              <>
                <dt>Parent approved</dt>
                <dd>
                  <span
                    className={
                      "admin-pill-tag" +
                      (athlete.parent_approved_at
                        ? " admin-pill-tag--green"
                        : " admin-pill-tag--blue")
                    }
                  >
                    {athlete.parent_approved_at ? "Y" : "N"}
                  </span>
                  {athlete.parent_approved_at ? (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontFamily: "var(--mono)",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(athlete.parent_approved_at as string)
                        .toISOString()
                        .slice(0, 10)}
                    </span>
                  ) : null}
                </dd>
                <dt>Parent</dt>
                <dd>
                  {(athlete.parent_first_name as string | null) ?? "—"}{" "}
                  {athlete.parent_email ? (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      ({athlete.parent_email})
                    </span>
                  ) : null}
                </dd>
                {!athlete.parent_approved_at ? (
                  <>
                    <dt>Approval email</dt>
                    <dd>
                      <span
                        className={
                          "admin-pill-tag" +
                          (athlete.parent_approval_email_status === "sent"
                            ? " admin-pill-tag--green"
                            : athlete.parent_approval_email_status === "failed"
                            ? " admin-pill-tag--red"
                            : "")
                        }
                      >
                        {(athlete.parent_approval_email_status as
                          | string
                          | null) ?? "—"}
                      </span>
                      {athlete.parent_approval_token_sent_at ? (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontFamily: "var(--mono)",
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          last sent{" "}
                          {new Date(
                            athlete.parent_approval_token_sent_at as string
                          )
                            .toISOString()
                            .slice(0, 16)
                            .replace("T", " ")}
                        </span>
                      ) : null}
                    </dd>
                    <dt>Fallback code</dt>
                    <dd
                      style={{
                        fontFamily: "var(--mono)",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {(athlete.parent_approval_code as string | null) ?? "—"}
                    </dd>
                  </>
                ) : null}
              </>
            ) : null}
          </dl>
        </div>

        {/* RIGHT: action buttons */}
        <div className="admin-detail-card">
          <h2>Actions</h2>
          <div className="admin-stack" style={{ marginTop: "0.85rem" }}>
            <form
              action={isVerified ? unverifyAthleteAction : verifyAthleteAction}
            >
              <input type="hidden" name="athlete_id" value={athleteId} />
              <button
                type="submit"
                className={
                  "admin-btn" +
                  (isVerified ? " admin-btn--danger" : " admin-btn--gold")
                }
              >
                {isVerified ? "Unverify athlete" : "Mark verified"}
              </button>
            </form>

            {athlete.is_minor ? (
              <>
                <form
                  action={
                    athlete.parent_approved_at
                      ? revokeParentAction
                      : approveParentAction
                  }
                >
                  <input type="hidden" name="athlete_id" value={athleteId} />
                  <button
                    type="submit"
                    className={
                      "admin-btn" +
                      (athlete.parent_approved_at
                        ? " admin-btn--danger"
                        : " admin-btn--gold")
                    }
                  >
                    {athlete.parent_approved_at
                      ? "Revoke parent approval"
                      : "Mark parent approved"}
                  </button>
                </form>
                {!athlete.parent_approved_at ? (
                  <form action={adminResendParentConsentAction}>
                    <input type="hidden" name="athlete_id" value={athleteId} />
                    <button type="submit" className="admin-btn">
                      Resend parent email
                    </button>
                  </form>
                ) : null}
              </>
            ) : null}

            <form action={setSubscriptionAction} className="admin-inline-form">
              <input type="hidden" name="athlete_id" value={athleteId} />
              <input type="hidden" name="status" value="active" />
              <select name="tier" className="admin-select" defaultValue="starter">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="champion">Champion</option>
              </select>
              <button type="submit" className="admin-btn admin-btn--gold">
                Mark subscription active
              </button>
            </form>

            <form action={setSubscriptionAction}>
              <input type="hidden" name="athlete_id" value={athleteId} />
              <input type="hidden" name="status" value="inactive" />
              <button type="submit" className="admin-btn admin-btn--danger">
                Mark inactive
              </button>
            </form>

            <Link
              href={`/admin/athletes/${athleteId}/export`}
              className="admin-btn"
            >
              Export approved list (CSV)
            </Link>
          </div>
        </div>
      </div>

      {/* Deal menu */}
      <details className="admin-panel" open>
        <summary
          className="admin-panel__head"
          style={{ cursor: "pointer", listStyle: "none" }}
        >
          <div className="admin-panel__title">Deal menu</div>
          <span className="admin-panel__count">read-only</span>
        </summary>
        <div className="admin-panel__body">
          {!deal ? (
            <div className="admin-empty">No deal menu yet</div>
          ) : (
            <dl className="admin-kv">
              <dt>Cash per post</dt>
              <dd>
                {deal.cash_per_post_enabled
                  ? `Yes — min $${deal.cash_per_post_min ?? 0}`
                  : "Off"}
              </dd>
              <dt>Product trade</dt>
              <dd>{deal.product_trade_enabled ? "Yes" : "Off"}</dd>
              <dt>Appearance</dt>
              <dd>
                {deal.appearance_enabled
                  ? `Yes — min $${deal.appearance_min ?? 0}`
                  : "Off"}
              </dd>
              <dt>Mutual promo</dt>
              <dd>{deal.mutual_promo_enabled ? "Yes" : "Off"}</dd>
            </dl>
          )}
        </div>
      </details>

      {/* Cities + categories */}
      <details className="admin-panel" open>
        <summary
          className="admin-panel__head"
          style={{ cursor: "pointer", listStyle: "none" }}
        >
          <div className="admin-panel__title">Pitch locations + categories</div>
        </summary>
        <div className="admin-panel__body">
          <div style={{ marginBottom: "0.5rem" }}>
            <span className="admin-label">Cities</span>
            {cities.length === 0 ? (
              <div className="admin-empty">None</div>
            ) : (
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {cities.map((c, i) => (
                  <span key={i} className="admin-pill-tag">
                    {c.city}, {c.state} · {c.radius_miles ?? 10}mi
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <span className="admin-label">Business categories</span>
            {!Array.isArray(athlete.business_categories) ||
            athlete.business_categories.length === 0 ? (
              <div className="admin-empty">None</div>
            ) : (
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {(athlete.business_categories as string[]).map((cat) => (
                  <span key={cat} className="admin-pill-tag">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </details>

      {/* Admin notes */}
      <details className="admin-panel" open>
        <summary
          className="admin-panel__head"
          style={{ cursor: "pointer", listStyle: "none" }}
        >
          <div className="admin-panel__title">Admin notes</div>
        </summary>
        <div className="admin-panel__body">
          <form action={saveAthleteNotesAction} className="admin-form">
            <input type="hidden" name="athlete_id" value={athleteId} />
            <textarea
              className="admin-textarea"
              name="admin_notes"
              placeholder="Internal-only notes about this athlete"
              defaultValue={(athlete.admin_notes as string | null) ?? ""}
            />
            <div>
              <button type="submit" className="admin-btn admin-btn--gold">
                Save notes
              </button>
            </div>
          </form>
        </div>
      </details>

      {/* Target list */}
      <div className="admin-section-head">
        <h3>Target list</h3>
        <span className="admin-panel__count">{targets.length} rows</span>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {targets.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              No target list yet
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Business</th>
                  <th>City</th>
                  <th>Email</th>
                  <th>Category</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <tr key={t.id}>
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
                    <td>
                      {t.businesses ? (
                        <Link href={`/admin/businesses/${t.businesses.id}`}>
                          {t.businesses.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {t.businesses?.city ?? "—"}
                      {t.businesses?.state ? `, ${t.businesses.state}` : ""}
                    </td>
                    <td>
                      {t.businesses?.email ? (
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.78rem",
                          }}
                        >
                          {t.businesses.email}
                        </span>
                      ) : (
                        <span className="admin-pill-tag admin-pill-tag--red">
                          MISSING
                        </span>
                      )}
                    </td>
                    <td>{t.source_category ?? "—"}</td>
                    <td>
                      {t.businesses && t.status === "approved" ? (
                        <LogPitchRow
                          athleteId={athleteId}
                          businessId={t.businesses.id}
                          targetListId={t.id}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Pitches sent for this athlete */}
      <div className="admin-section-head">
        <h3>Pitches</h3>
        <span className="admin-panel__count">{pitches.length}</span>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {pitches.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              No pitches yet
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sent</th>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Replied</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.sent_at
                        ? new Date(p.sent_at).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td>{p.businesses?.name ?? "—"}</td>
                    <td>
                      <span className="admin-pill-tag">{p.status}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      {p.responded_at
                        ? new Date(p.responded_at).toISOString().slice(0, 10)
                        : "—"}
                      {p.response_text
                        ? ` — ${p.response_text.slice(0, 60)}`
                        : ""}
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
