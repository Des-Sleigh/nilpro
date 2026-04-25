"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { setPitchStatusAction } from "@/app/admin/pitches/actions";

export type PitchRow = {
  id: string;
  status: string;
  sent_at: string | null;
  responded_at: string | null;
  response_text: string | null;
  athlete_id: string;
  business_id: string;
  athlete_name: string;
  business_name: string;
};

const STATUSES = [
  "queued",
  "sent",
  "opened",
  "replied_yes",
  "replied_counter",
  "replied_no",
  "unsubscribed",
  "no_response",
  "bounced",
];

type Filter = "all" | "sent" | "replied" | "no_response" | "bounced";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sent", label: "Sent" },
  { id: "replied", label: "Replied" },
  { id: "no_response", label: "No response" },
  { id: "bounced", label: "Bounced" },
];

export function PitchesTable({ rows }: { rows: PitchRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "sent" && r.status !== "sent" && r.status !== "queued" && r.status !== "opened")
        return false;
      if (filter === "replied" && !r.status.startsWith("replied_")) return false;
      if (filter === "no_response" && r.status !== "no_response") return false;
      if (filter === "bounced" && r.status !== "bounced") return false;
      if (term) {
        const hay = `${r.athlete_name} ${r.business_name}`.toLowerCase();
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
        placeholder="Search athlete or business..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <section className="admin-panel">
        <div className="admin-panel__body admin-panel__body--flush">
          {filtered.length === 0 ? (
            <div className="admin-empty" style={{ padding: "1rem" }}>
              ✓ No pitches match
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Replied</th>
                  <th>Response</th>
                  <th style={{ width: "1%" }}>Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/athletes/${r.athlete_id}`}>
                        {r.athlete_name}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/businesses/${r.business_id}`}>
                        {r.business_name}
                      </Link>
                    </td>
                    <td>
                      <span className="admin-pill-tag">{r.status}</span>
                    </td>
                    <td>
                      {r.sent_at
                        ? new Date(r.sent_at).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td>
                      {r.responded_at
                        ? new Date(r.responded_at).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td style={{ fontSize: "0.82rem", maxWidth: "20rem" }}>
                      {r.response_text
                        ? r.response_text.slice(0, 60) +
                          (r.response_text.length > 60 ? "…" : "")
                        : "—"}
                    </td>
                    <td>
                      <form action={setPitchStatusAction} className="admin-inline-form">
                        <input type="hidden" name="pitch_id" value={r.id} />
                        <select
                          name="status"
                          className="admin-select"
                          defaultValue={r.status}
                          style={{ minWidth: "9rem" }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="admin-btn admin-btn--sm"
                        >
                          Set
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
    </>
  );
}
