"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitReviewAction } from "@/app/signup/review/actions";
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

/**
 * Parse the textarea into trimmed, lowercased, unique terms. Empty lines
 * are dropped. We lowercase here so case-insensitive comparisons later
 * are cheap.
 */
function parseBlacklistTerms(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim().toLowerCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function TargetReviewList({
  businesses,
  initialBlacklistTerms,
}: {
  businesses: ReviewBusiness[];
  initialBlacklistTerms: string[];
}) {
  const [blacklistText, setBlacklistText] = useState<string>(
    initialBlacklistTerms.join("\n")
  );

  // Live-filter the review list by the athlete's skip-list. Any business
  // whose name contains one of these terms (case-insensitive) gets hidden
  // from the UI — and implicitly won't be submitted because we only send
  // business_ids that are still checked in `selected`.
  const activeTerms = useMemo(
    () => parseBlacklistTerms(blacklistText),
    [blacklistText]
  );

  const visibleBusinesses = useMemo(() => {
    if (activeTerms.length === 0) return businesses;
    return businesses.filter((b) => {
      const lower = b.name.toLowerCase();
      return !activeTerms.some((term) => lower.includes(term));
    });
  }, [businesses, activeTerms]);

  const initiallySelected = useMemo(
    () => new Set(businesses.map((b) => b.business_id)),
    [businesses]
  );
  const [selected, setSelected] = useState<Set<string>>(initiallySelected);

  // Group by category. We derive this from the *visible* list so empty
  // (all-filtered-out) categories vanish.
  const grouped = useMemo(() => {
    const map = new Map<string, ReviewBusiness[]>();
    for (const b of visibleBusinesses) {
      const arr = map.get(b.category) ?? [];
      arr.push(b);
      map.set(b.category, arr);
    }
    return Array.from(map.entries());
  }, [visibleBusinesses]);

  // Accordion open state (all closed by default).
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set<string>()
  );

  function toggleCategoryOpen(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const b of visibleBusinesses) next.add(b.business_id);
      return next;
    });
  }
  function deselectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const b of visibleBusinesses) next.delete(b.business_id);
      return next;
    });
  }

  function selectAllInCategory(rows: ReviewBusiness[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const b of rows) next.add(b.business_id);
      return next;
    });
  }
  function deselectAllInCategory(rows: ReviewBusiness[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const b of rows) next.delete(b.business_id);
      return next;
    });
  }

  // Count of currently-checked AND currently-visible businesses (used for
  // the submit-button label and header tally).
  const visibleSelectedCount = useMemo(() => {
    let n = 0;
    for (const b of visibleBusinesses) if (selected.has(b.business_id)) n++;
    return n;
  }, [visibleBusinesses, selected]);

  return (
    <form action={submitReviewAction} className="auth-form">
      {/* Skip-list textarea — drives the live filter below. */}
      <label className="auth-form__label">
        <span>Businesses to skip</span>
        <textarea
          name="blacklist_terms"
          rows={4}
          value={blacklistText}
          onChange={(e) => setBlacklistText(e.target.value)}
          placeholder={"Papa John's\nJimmy John's"}
          spellCheck={false}
          className="auth-form__input"
          style={{ fontFamily: "var(--mono)", resize: "vertical" }}
        />
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          Paste names one per line — Papa John&apos;s, Jimmy John&apos;s, etc.
          We&apos;ll never pitch these, even as new ones pop up in your area.
        </span>
      </label>

      {/* Overall tally + global select/deselect. */}
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
          {visibleSelectedCount} of {visibleBusinesses.length} selected
          {visibleBusinesses.length !== businesses.length ? (
            <span style={{ color: "var(--gold)", marginLeft: "0.5rem" }}>
              · {businesses.length - visibleBusinesses.length} hidden
            </span>
          ) : null}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={selectAllVisible}
            className="btn btn--ghost btn--sm"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={deselectAllVisible}
            className="btn btn--ghost btn--sm"
          >
            Deselect all
          </button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div
          style={{
            padding: "1.25rem",
            background: "var(--bg-soft)",
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--r-sm)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Every business is currently being skipped by your list above. Clear a
          term to see results.
        </div>
      ) : null}

      {grouped.map(([category, rows]) => {
        const open = openCategories.has(category);
        const checkedInGroup = rows.reduce(
          (n, b) => (selected.has(b.business_id) ? n + 1 : n),
          0
        );
        const allChecked = checkedInGroup === rows.length;

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 0.9rem",
                borderBottom: open ? "1px solid var(--border)" : "none",
                background: "var(--bg)",
              }}
            >
              <button
                type="button"
                onClick={() => toggleCategoryOpen(category)}
                aria-expanded={open}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "0.15rem 0",
                  color: "var(--text)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    transform: open ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                    color: "var(--green)",
                    fontFamily: "var(--mono)",
                    fontSize: "0.8rem",
                  }}
                >
                  ▶
                </span>
                <span
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    color: "var(--text)",
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
                  {checkedInGroup} / {rows.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  allChecked
                    ? deselectAllInCategory(rows)
                    : selectAllInCategory(rows)
                }
                className="btn btn--ghost btn--sm"
                style={{ padding: "0.35rem 0.65rem", fontSize: "0.72rem" }}
              >
                {allChecked ? "Deselect all" : "Select all"}
              </button>
            </div>

            {open ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  padding: "0.75rem",
                }}
              >
                {rows.map((b) => {
                  const isSelected = selected.has(b.business_id);
                  return (
                    <label
                      key={b.target_id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: "0.85rem",
                        alignItems: "flex-start",
                        padding: "0.75rem 0.9rem",
                        border: `2px solid ${
                          isSelected ? "var(--green)" : "var(--border-strong)"
                        }`,
                        background: isSelected
                          ? "var(--green-dim)"
                          : "var(--bg)",
                        borderRadius: "var(--r-sm)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="include"
                        value={b.business_id}
                        checked={isSelected}
                        onChange={() => toggle(b.business_id)}
                        style={{
                          marginTop: "0.2rem",
                          accentColor: "var(--green)",
                          width: "18px",
                          height: "18px",
                        }}
                      />
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
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}

      <SubmitButton count={visibleSelectedCount} />
    </form>
  );
}
