"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitReviewAction, blacklistBusinessAction } from "@/app/signup/review/actions";
import { CATEGORY_LABELS } from "@/lib/places/categories";

export type ReviewBusiness = {
  target_id: string;
  business_id: string;
  name: string;
  category: string;
  city: string | null;
  state: string | null;
  rating: number | null;
  ratings_count: number | null;
};

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending
        ? "Saving…"
        : `Confirm ${count} target${count === 1 ? "" : "s"} →`}
    </button>
  );
}

export function TargetReviewList({
  businesses,
}: {
  businesses: ReviewBusiness[];
}) {
  const initiallySelected = useMemo(
    () => new Set(businesses.map((b) => b.business_id)),
    [businesses]
  );
  const [selected, setSelected] = useState<Set<string>>(initiallySelected);

  const grouped = useMemo(() => {
    const map = new Map<string, ReviewBusiness[]>();
    for (const b of businesses) {
      const arr = map.get(b.category) ?? [];
      arr.push(b);
      map.set(b.category, arr);
    }
    return Array.from(map.entries());
  }, [businesses]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(businesses.map((b) => b.business_id)));
  }
  function deselectAll() {
    setSelected(new Set());
  }

  return (
    <form action={submitReviewAction} className="auth-form">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.85rem 1rem",
          background: "var(--bg-soft)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {selected.size} of {businesses.length} selected
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={selectAll}
            className="btn btn--ghost btn--sm"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="btn btn--ghost btn--sm"
          >
            Deselect all
          </button>
        </div>
      </div>

      {grouped.map(([category, rows]) => (
        <div key={category} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--green)",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {CATEGORY_LABELS[category] ?? category} · {rows.length}
          </div>

          {rows.map((b) => {
            const isSelected = selected.has(b.business_id);
            return (
              <div
                key={b.target_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "0.85rem",
                  alignItems: "flex-start",
                  padding: "0.85rem 1rem",
                  border: `2px solid ${
                    isSelected ? "var(--green)" : "var(--border-strong)"
                  }`,
                  background: isSelected ? "var(--green-dim)" : "var(--bg-soft)",
                  borderRadius: "var(--r-sm)",
                  transition: "all 0.15s ease",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    paddingTop: "0.2rem",
                  }}
                >
                  <input
                    type="checkbox"
                    name="include"
                    value={b.business_id}
                    checked={isSelected}
                    onChange={() => toggle(b.business_id)}
                    style={{ accentColor: "var(--green)", width: "18px", height: "18px" }}
                  />
                </label>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--cond)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {b.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      marginTop: "0.15rem",
                    }}
                  >
                    {b.city && b.state ? `${b.city}, ${b.state}` : "—"}
                    {b.rating !== null && b.rating !== undefined
                      ? ` · ★ ${b.rating.toFixed(1)}${
                          b.ratings_count ? ` (${b.ratings_count})` : ""
                        }`
                      : ""}
                  </div>
                </div>
                <BlacklistButton businessId={b.business_id} />
              </div>
            );
          })}
        </div>
      ))}

      <SubmitButton count={selected.size} />
    </form>
  );
}

function BlacklistButton({ businessId }: { businessId: string }) {
  return (
    <form action={blacklistBusinessAction} style={{ display: "inline-flex" }}>
      <input type="hidden" name="business_id" value={businessId} />
      <button
        type="submit"
        className="btn btn--ghost btn--sm"
        title="Never show this business to any athlete again"
        style={{ padding: "0.35rem 0.65rem", fontSize: "0.72rem" }}
      >
        ⌫ Blacklist
      </button>
    </form>
  );
}
