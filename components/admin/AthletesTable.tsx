"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type AthleteRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  level: string;
  sport: string;
  school: string;
  subscription_status: string | null;
  is_minor: boolean;
  parent_approved_at: string | null;
  verified: boolean;
  created_at: string | null;
};

type Filter = "all" | "paid" | "pending_verify" | "pending_parent" | "free";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "pending_verify", label: "Pending verification" },
  { id: "pending_parent", label: "Pending parent approval" },
  { id: "free", label: "Free" },
];

function formatDate(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

export function AthletesTable({ rows }: { rows: AthleteRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "paid" && r.subscription_status !== "active") return false;
      if (filter === "free" && r.subscription_status === "active") return false;
      if (filter === "pending_verify" && r.verified) return false;
      if (
        filter === "pending_parent" &&
        !(r.is_minor && !r.parent_approved_at)
      )
        return false;
      if (term) {
        const hay = [
          r.first_name,
          r.last_name,
          r.email ?? "",
          r.school,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, filter, q]);

  return (
    <>
      <div className="admin-chips">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={
              "admin-chip" +
              (filter === f.id ? " admin-chip--active" : "")
            }
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        className="admin-search"
        type="search"
        placeholder="Search name, email, school..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {filtered.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ No athletes match
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Level / Sport</th>
                  <th>School</th>
                  <th>Sub</th>
                  <th>Verified</th>
                  <th>Parent</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/athletes/${r.id}`}>
                        {r.first_name} {r.last_name}
                      </Link>
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "0.78rem" }}>
                      {r.email ?? "—"}
                    </td>
                    <td>
                      {r.level} · {r.sport}
                    </td>
                    <td>{r.school}</td>
                    <td>
                      <span
                        className={
                          "admin-pill-tag" +
                          (r.subscription_status === "active"
                            ? " admin-pill-tag--gold"
                            : "")
                        }
                      >
                        {r.subscription_status ?? "free"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          "admin-pill-tag" +
                          (r.verified
                            ? " admin-pill-tag--green"
                            : " admin-pill-tag--blue")
                        }
                      >
                        {r.verified ? "Y" : "N"}
                      </span>
                    </td>
                    <td>
                      {r.is_minor ? (
                        <span
                          className={
                            "admin-pill-tag" +
                            (r.parent_approved_at
                              ? " admin-pill-tag--green"
                              : " admin-pill-tag--blue")
                          }
                        >
                          {r.parent_approved_at ? "Y" : "N"}
                        </span>
                      ) : (
                        <span className="admin-pill-tag admin-pill-tag--muted">
                          N/A
                        </span>
                      )}
                    </td>
                    <td>{formatDate(r.created_at)}</td>
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
