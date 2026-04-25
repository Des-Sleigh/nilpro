"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setTargetStatusAction,
  skipBusinessFromTargetListAction,
  skipBusinessByNameFromTargetListAction,
  unskipTermFromTargetListAction,
  addPlacesBusinessToTargetListAction,
} from "@/app/target-list/actions";
import { CATEGORY_LABELS } from "@/lib/places/categories";
import { AddBusinessSearch } from "@/components/auth/AddBusinessSearch";

export type TargetRowView = {
  target_id: string;
  business_id: string;
  status: "approved" | "pending" | "removed";
  name: string;
  category: string;
  city: string | null;
  state: string | null;
  rating: number | null;
  ratings_count: number | null;
};

type Tab = "approved" | "pending" | "removed" | "all";

export function TargetListManager({
  rows,
  initialBlacklistTerms = [],
  defaultCity = null,
  defaultState = null,
}: {
  rows: TargetRowView[];
  initialBlacklistTerms?: string[];
  defaultCity?: string | null;
  defaultState?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("approved");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [blacklistTerms, setBlacklistTerms] = useState<string[]>(
    initialBlacklistTerms
  );

  const filtered = useMemo(() => {
    if (tab === "all") return rows;
    return rows.filter((r) => r.status === tab);
  }, [rows, tab]);

  const grouped = useMemo(() => {
    const map = new Map<string, TargetRowView[]>();
    for (const r of filtered) {
      const arr = map.get(r.category) ?? [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(grouped.map(([c]) => c))
  );

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function runStatusChange(targetId: string, status: TargetRowView["status"]) {
    const fd = new FormData();
    fd.set("target_id", targetId);
    fd.set("status", status);
    startTransition(() => {
      void setTargetStatusAction(fd).then(() => router.refresh());
    });
  }

  function runSkip(row: TargetRowView) {
    const fd = new FormData();
    fd.set("business_id", row.business_id);
    fd.set("business_name", row.name);
    // Optimistic — same pattern as the review screen.
    const term = row.name.trim().toLowerCase();
    setBlacklistTerms((prev) =>
      prev.includes(term) ? prev : [...prev, term]
    );
    startTransition(() => {
      void skipBusinessFromTargetListAction(fd).then(() => router.refresh());
    });
  }

  function handleSkipByName(name: string) {
    const term = name.trim().toLowerCase();
    if (!term) return;
    setBlacklistTerms((prev) =>
      prev.includes(term) ? prev : [...prev, term]
    );
  }

  // Used by the fallback plain-text input — Places search has its own
  // `addSkipAction` wired in, which persists server-side. This handler
  // covers the "Or type a name" path so manually typed names also hit
  // the database.
  function handleSkipByNamePersist(name: string) {
    const term = name.trim().toLowerCase();
    if (!term) return;
    handleSkipByName(term);
    startTransition(() => {
      void skipBusinessByNameFromTargetListAction(term);
    });
  }

  function handleRemoveTerm(term: string) {
    setBlacklistTerms((prev) => prev.filter((t) => t !== term));
    const fd = new FormData();
    fd.set("term", term);
    startTransition(() => {
      void unskipTermFromTargetListAction(fd);
    });
  }

  const counts = useMemo(() => {
    let a = 0,
      p = 0,
      r = 0;
    for (const row of rows) {
      if (row.status === "approved") a++;
      else if (row.status === "pending") p++;
      else if (row.status === "removed") r++;
    }
    return { approved: a, pending: p, removed: r, all: rows.length };
  }, [rows]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <TabButton
            label={`Approved · ${counts.approved}`}
            active={tab === "approved"}
            onClick={() => setTab("approved")}
          />
          <TabButton
            label={`Pending · ${counts.pending}`}
            active={tab === "pending"}
            onClick={() => setTab("pending")}
          />
          <TabButton
            label={`Removed · ${counts.removed}`}
            active={tab === "removed"}
            onClick={() => setTab("removed")}
          />
          <TabButton
            label={`All · ${counts.all}`}
            active={tab === "all"}
            onClick={() => setTab("all")}
          />
        </div>
      </div>

      <AddBusinessSearch
        addAction={addPlacesBusinessToTargetListAction}
        defaultCity={defaultCity}
        defaultState={defaultState}
        onAdded={() => router.refresh()}
      />

      {grouped.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        grouped.map(([category, categoryRows]) => {
          const open = openCategories.has(category);
          return (
            <div
              key={category}
              style={{
                border: "1px solid var(--border-strong)",
                background: "var(--bg-soft)",
                borderRadius: "var(--r-sm)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={open}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 0.9rem",
                  borderBottom: open ? "1px solid var(--border)" : "none",
                  background: "var(--bg)",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    transform: open ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                    color: "var(--green)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  ▶
                </span>
                <span
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    flex: 1,
                  }}
                >
                  {CATEGORY_LABELS[category] ?? category}
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  {categoryRows.length}
                </span>
              </button>

              {open ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    padding: "0.75rem",
                  }}
                >
                  {categoryRows.map((row) => (
                    <TargetRow
                      key={row.target_id}
                      row={row}
                      disabled={pending}
                      onStatusChange={runStatusChange}
                      onSkip={runSkip}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })
      )}

      <SkipListSection
        terms={blacklistTerms}
        defaultCity={defaultCity}
        defaultState={defaultState}
        onPlacesAdd={handleSkipByName}
        onTypedAdd={handleSkipByNamePersist}
        onRemove={handleRemoveTerm}
      />
    </div>
  );
}

function SkipListSection({
  terms,
  defaultCity,
  defaultState,
  onPlacesAdd,
  onTypedAdd,
  onRemove,
}: {
  terms: string[];
  defaultCity: string | null;
  defaultState: string | null;
  /** Local-only chip-list update; persistence handled by AddBusinessSearch. */
  onPlacesAdd: (name: string) => void;
  /** Persists + chip-list update; used by the typed-name fallback. */
  onTypedAdd: (name: string) => void;
  onRemove: (term: string) => void;
}) {
  const [newTerm, setNewTerm] = useState("");

  function submit() {
    const t = newTerm.trim();
    if (!t) return;
    onTypedAdd(t);
    setNewTerm("");
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg-soft)",
        borderRadius: "var(--r-sm)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "0.35rem",
          }}
        >
          Skip list
        </div>
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          We&apos;ll never pitch any business whose name matches one of these —
          even brand new ones that pop up later.
        </div>
      </div>

      {terms.length === 0 ? (
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--text-faint)",
            fontStyle: "italic",
          }}
        >
          No skipped businesses yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {terms.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.35rem 0.65rem",
                border: "1px solid var(--border-strong)",
                background: "var(--bg)",
                color: "var(--text-dim)",
                fontFamily: "var(--mono)",
                fontSize: "0.78rem",
                borderRadius: "var(--r-pill)",
              }}
            >
              {t}
              <button
                type="button"
                onClick={() => onRemove(t)}
                aria-label={`Remove ${t} from skip list`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "var(--mono)",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <AddBusinessSearch
        mode="skip"
        defaultCity={defaultCity}
        defaultState={defaultState}
        addSkipAction={skipBusinessByNameFromTargetListAction}
        onAddSkip={onPlacesAdd}
      />

      <div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "0.4rem",
          }}
        >
          Or type a name
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "0.5rem",
          }}
        >
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Add business name to skip…"
            className="auth-form__input"
            style={{ fontFamily: "var(--mono)" }}
          />
          <button
            type="button"
            onClick={submit}
            className="btn btn--ghost btn--sm"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "0.55rem 0.95rem",
        border: `2px solid ${active ? "var(--green)" : "var(--border-strong)"}`,
        background: active ? "var(--green-dim)" : "var(--bg-soft)",
        color: active ? "var(--green)" : "var(--text-dim)",
        fontFamily: "var(--cond)",
        fontSize: "0.8rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: "var(--r-sm)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function TargetRow({
  row,
  disabled,
  onStatusChange,
  onSkip,
}: {
  row: TargetRowView;
  disabled: boolean;
  onStatusChange: (id: string, status: TargetRowView["status"]) => void;
  onSkip: (row: TargetRowView) => void;
}) {
  const statusColor =
    row.status === "approved"
      ? "var(--green)"
      : row.status === "pending"
        ? "var(--gold)"
        : "var(--text-faint)";
  const statusBg =
    row.status === "approved"
      ? "var(--green-dim)"
      : row.status === "pending"
        ? "rgba(255, 184, 0, 0.08)"
        : "var(--bg)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "0.75rem",
        padding: "0.75rem 0.9rem",
        border: `2px solid var(--border-strong)`,
        background: statusBg,
        borderRadius: "var(--r-sm)",
        alignItems: "center",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--cond)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {row.name}
        </div>
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            marginTop: "0.15rem",
          }}
        >
          {row.city && row.state ? `${row.city}, ${row.state}` : "—"}
          {row.rating !== null && row.rating !== undefined
            ? ` · ★ ${row.rating.toFixed(1)}${
                row.ratings_count ? ` (${row.ratings_count})` : ""
              }`
            : ""}
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: statusColor,
              marginLeft: "0.5rem",
              fontWeight: 700,
            }}
          >
            · {row.status}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {row.status !== "approved" ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onStatusChange(row.target_id, "approved")}
            className="btn btn--ghost btn--sm"
          >
            Approve
          </button>
        ) : null}
        {row.status !== "removed" ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onStatusChange(row.target_id, "removed")}
            className="btn btn--ghost btn--sm"
          >
            Remove
          </button>
        ) : null}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSkip(row)}
          className="btn btn--ghost btn--sm"
          title="Add to skip list & remove"
        >
          × Skip
        </button>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const labelByTab: Record<Tab, string> = {
    approved: "No approved businesses yet.",
    pending: "No pending businesses — all caught up.",
    removed: "No removed businesses.",
    all: "No businesses on your list yet.",
  };
  return (
    <div
      style={{
        padding: "2rem 1.5rem",
        border: "1px dashed var(--border-strong)",
        background: "var(--bg-soft)",
        borderRadius: "var(--r-md)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "0.95rem",
          color: "var(--text-dim)",
          marginBottom: "1rem",
          lineHeight: 1.55,
        }}
      >
        {labelByTab[tab]}
      </div>
      <Link href="/settings/cities" className="btn btn--ghost btn--sm">
        Adjust cities & categories
      </Link>
    </div>
  );
}

