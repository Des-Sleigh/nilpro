import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyAthleteAction,
  approveParentAction,
  setSubscriptionAction,
  adminResendParentConsentAction,
} from "@/app/admin/athletes/[id]/actions";
import { CopyCodeButton } from "@/components/admin/CopyCodeButton";

export const metadata: Metadata = {
  title: "Action queue — NILPro Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  const sb = createAdminClient();

  const [athletesRes, socialsRes, targetsRes, pitchesRes, businessesRes] =
    await Promise.all([
      sb
        .from("athletes")
        .select(
          "id, first_name, last_name, is_minor, parent_first_name, parent_email, parent_approved_at, parent_approval_email_status, subscription_status, subscription_tier"
        ),
      sb.from("social_accounts").select("*"),
      sb
        .from("target_lists")
        .select("athlete_id, status, business_id"),
      sb
        .from("pitches")
        .select(
          "id, status, sent_at, athlete_id, business_id, athletes(first_name,last_name), businesses(name), response_text"
        )
        .order("sent_at", { ascending: false })
        .limit(500),
      sb
        .from("businesses")
        .select("id, name, city, state, email")
        .is("email", null),
    ]);

  const athletes = athletesRes.data ?? [];
  const socials = (socialsRes.data ?? []) as Array<{
    athlete_id: string;
    platform: string;
    handle: string;
    verified: boolean;
    verification_code: string | null;
    created_at: string | null;
  }>;
  const targets = targetsRes.data ?? [];

  // 1. Awaiting IG verification
  const igBy = new Map<string, (typeof socials)[number]>();
  for (const s of socials) {
    if (s.platform === "instagram") igBy.set(s.athlete_id, s);
  }
  // Show only athletes who have an IG row at all — pre-IG athletes
  // shouldn't clog this queue. Sort oldest pending first (FIFO).
  const awaitingVerify = athletes
    .filter((a) => {
      const ig = igBy.get(a.id as string);
      return ig && !ig.verified;
    })
    .sort((a, b) => {
      const aIg = igBy.get(a.id as string);
      const bIg = igBy.get(b.id as string);
      const at = aIg?.created_at ?? "";
      const bt = bIg?.created_at ?? "";
      // oldest first
      return at.localeCompare(bt);
    });

  // 2. Awaiting parent approval
  const awaitingParent = athletes.filter(
    (a) => a.is_minor && !a.parent_approved_at
  );

  // 3. Awaiting payment — completed signup (>=1 approved target row), not active
  const approvedAthleteIds = new Set<string>();
  for (const t of targets) {
    if (t.status === "approved") {
      approvedAthleteIds.add(t.athlete_id as string);
    }
  }
  const awaitingPayment = athletes.filter(
    (a) =>
      a.subscription_status !== "active" &&
      approvedAthleteIds.has(a.id as string)
  );

  // 4. Businesses missing email AND on at least one approved target list
  const approvedBusinessIds = new Set<string>();
  for (const t of targets) {
    if (t.status === "approved" && t.business_id) {
      approvedBusinessIds.add(t.business_id as string);
    }
  }
  const missingEmailAll = (businessesRes.data ?? []).filter((b) =>
    approvedBusinessIds.has(b.id as string)
  );
  const missingEmailFirst50 = missingEmailAll.slice(0, 50);
  const missingEmailRest = Math.max(0, missingEmailAll.length - 50);

  // 5. Pitches awaiting reply review
  type AthleteMini = { first_name: string; last_name: string };
  type BizMini = { name: string };
  type PitchRaw = {
    id: string;
    status: string;
    sent_at: string | null;
    athlete_id: string;
    business_id: string;
    athletes: AthleteMini | AthleteMini[] | null;
    businesses: BizMini | BizMini[] | null;
    response_text: string | null;
  };
  const replied = ((pitchesRes.data ?? []) as unknown as PitchRaw[])
    .filter((p) => String(p.status ?? "").startsWith("replied_"))
    .map((p) => ({
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
        Action <em>queue</em>
      </h1>
      <div className="admin-sub">Things that need a human decision</div>

      {/* 1 */}
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div className="admin-panel__title">Awaiting IG verification</div>
          <span className="admin-panel__count">{awaitingVerify.length}</span>
        </div>
        <div className="admin-panel__body admin-panel__body--flush">
          {awaitingVerify.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ No athletes awaiting verification
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>IG handle</th>
                  <th>Verification code</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {awaitingVerify.map((a) => {
                  const ig = igBy.get(a.id as string);
                  const code = ig?.verification_code ?? null;
                  const handle = ig?.handle ?? null;
                  return (
                    <tr key={a.id as string}>
                      <td>
                        <Link href={`/admin/athletes/${a.id}`}>
                          {a.first_name} {a.last_name}
                        </Link>
                      </td>
                      <td
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {handle ? (
                          <a
                            href={`https://instagram.com/${handle}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            @{handle} ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          color: "var(--gold)",
                        }}
                      >
                        {code ?? "—"}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.4rem",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {code ? <CopyCodeButton code={code} /> : null}
                          <form action={verifyAthleteAction}>
                            <input
                              type="hidden"
                              name="athlete_id"
                              value={a.id as string}
                            />
                            <button
                              type="submit"
                              className="admin-btn admin-btn--gold admin-btn--sm"
                            >
                              Verify ✓
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 2 */}
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div className="admin-panel__title">Awaiting parent approval</div>
          <span className="admin-panel__count">{awaitingParent.length}</span>
        </div>
        <div className="admin-panel__body admin-panel__body--flush">
          {awaitingParent.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ Nothing here
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Parent</th>
                  <th>Parent email</th>
                  <th>Email status</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {awaitingParent.map((a) => {
                  const emailStatus =
                    (a.parent_approval_email_status as string | null) ?? null;
                  const statusModifier =
                    emailStatus === "sent"
                      ? " admin-pill-tag--green"
                      : emailStatus === "failed"
                      ? " admin-pill-tag--red"
                      : "";
                  return (
                    <tr key={a.id as string}>
                      <td>
                        <Link href={`/admin/athletes/${a.id}`}>
                          {a.first_name} {a.last_name}
                        </Link>
                      </td>
                      <td>{(a.parent_first_name as string | null) ?? "—"}</td>
                      <td
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {(a.parent_email as string | null) ?? "—"}
                      </td>
                      <td>
                        <span className={"admin-pill-tag" + statusModifier}>
                          {emailStatus ?? "—"}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.4rem",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <form action={adminResendParentConsentAction}>
                            <input
                              type="hidden"
                              name="athlete_id"
                              value={a.id as string}
                            />
                            <button
                              type="submit"
                              className="admin-btn admin-btn--sm"
                            >
                              Resend email
                            </button>
                          </form>
                          <form action={approveParentAction}>
                            <input
                              type="hidden"
                              name="athlete_id"
                              value={a.id as string}
                            />
                            <button
                              type="submit"
                              className="admin-btn admin-btn--gold admin-btn--sm"
                            >
                              Approve parent
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 3 */}
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div className="admin-panel__title">Awaiting payment</div>
          <span className="admin-panel__count">{awaitingPayment.length}</span>
        </div>
        <div className="admin-panel__body admin-panel__body--flush">
          {awaitingPayment.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ Nothing here
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Current</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {awaitingPayment.map((a) => (
                  <tr key={a.id as string}>
                    <td>
                      <Link href={`/admin/athletes/${a.id}`}>
                        {a.first_name} {a.last_name}
                      </Link>
                    </td>
                    <td>
                      <span className="admin-pill-tag">
                        {(a.subscription_status as string | null) ?? "free"}
                      </span>
                    </td>
                    <td>
                      <form
                        action={setSubscriptionAction}
                        className="admin-inline-form"
                      >
                        <input
                          type="hidden"
                          name="athlete_id"
                          value={a.id as string}
                        />
                        <input type="hidden" name="status" value="active" />
                        <select
                          name="tier"
                          className="admin-select"
                          defaultValue="starter"
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="champion">Champion</option>
                        </select>
                        <button
                          type="submit"
                          className="admin-btn admin-btn--gold admin-btn--sm"
                        >
                          Mark paid
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 4 */}
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div className="admin-panel__title">
            Businesses missing email
            {missingEmailRest > 0 ? (
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "none",
                  letterSpacing: "0.04em",
                }}
              >
                (+{missingEmailRest} more)
              </span>
            ) : null}
          </div>
          <span className="admin-panel__count">{missingEmailAll.length}</span>
        </div>
        <div className="admin-panel__body admin-panel__body--flush">
          {missingEmailFirst50.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ Nothing here
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>City / State</th>
                </tr>
              </thead>
              <tbody>
                {missingEmailFirst50.map((b) => (
                  <tr key={b.id as string}>
                    <td>
                      <Link href={`/admin/businesses/${b.id}`}>{b.name}</Link>
                    </td>
                    <td>
                      {b.city ?? "—"}
                      {b.state ? `, ${b.state}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 5 */}
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div className="admin-panel__title">Pitches awaiting reply review</div>
          <span className="admin-panel__count">{replied.length}</span>
        </div>
        <div className="admin-panel__body admin-panel__body--flush">
          {replied.length === 0 ? (
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
                  <th>Response</th>
                  <th style={{ width: "1%" }}></th>
                </tr>
              </thead>
              <tbody>
                {replied.map((p) => (
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
                    <td style={{ fontSize: "0.82rem", maxWidth: "20rem" }}>
                      {p.response_text
                        ? p.response_text.slice(0, 60) +
                          (p.response_text.length > 60 ? "…" : "")
                        : "—"}
                    </td>
                    <td>
                      <Link
                        href="/admin/pitches"
                        className="admin-btn admin-btn--sm"
                      >
                        Review
                      </Link>
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
