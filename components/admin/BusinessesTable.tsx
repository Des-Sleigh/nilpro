"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BusinessRow = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  primary_category: string | null;
  email: string | null;
  phone: string | null;
  google_rating: number | null;
  global_blacklisted: boolean;
  athlete_count: number;
  created_at: string | null;
};

type Filter = "all" | "missing_email" | "blacklisted" | "has_email";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "missing_email", label: "Missing email" },
  { id: "blacklisted", label: "Globally blacklisted" },
  { id: "has_email", label: "Has email" },
];

export function BusinessesTable({ rows }: { rows: BusinessRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "missing_email" && r.email) return false;
      if (filter === "has_email" && !r.email) return false;
      if (filter === "blacklisted" && !r.global_blacklisted) return false;
      if (term) {
        const hay = [r.name, r.city ?? ""].join(" ").toLowerCase();
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
        placeholder="Search name or city..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {filtered.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ No businesses match
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City / State</th>
                  <th>Category</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Rating</th>
                  <th>Blacklisted</th>
                  <th># athletes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/businesses/${r.id}`}>{r.name}</Link>
                    </td>
                    <td>
                      {r.city ?? "—"}
                      {r.state ? `, ${r.state}` : ""}
                    </td>
                    <td>{r.primary_category ?? "—"}</td>
                    <td>
                      {r.email ? (
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.78rem",
                          }}
                        >
                          {r.email}
                        </span>
                      ) : (
                        <span className="admin-pill-tag admin-pill-tag--red">
                          MISSING
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {r.phone ?? "—"}
                    </td>
                    <td>{r.google_rating ?? "—"}</td>
                    <td>
                      <span
                        className={
                          "admin-pill-tag" +
                          (r.global_blacklisted
                            ? " admin-pill-tag--red"
                            : " admin-pill-tag--muted")
                        }
                      >
                        {r.global_blacklisted ? "Y" : "N"}
                      </span>
                    </td>
                    <td>{r.athlete_count}</td>
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
