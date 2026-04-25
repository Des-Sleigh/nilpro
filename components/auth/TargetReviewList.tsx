"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  submitReviewAction,
  skipBusinessAction,
  skipBusinessByNameAction,
  unskipTermAction,
  addPlacesBusinessAction,
} from "@/app/signup/review/actions";
import { CATEGORY_LABELS } from "@/lib/places/categories";
import { AddBusinessSearch } from "@/components/auth/AddBusinessSearch";

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
      className={`btn btn--primary btn--lg${pending ? " btn--pending" : ""}`}
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending ? (
        <>
          <span aria-hidden className="btn__spinner" />
          Saving…
        </>
      ) : (
        `Confirm ${count} target${count === 1 ? "" : "s"} →`
      )}
    </button>
  );
}

export function TargetReviewList({
  businesses,
  initialBlacklistTerms,
  defaultCity = null,
  defaultState = null,
}: {
  businesses: ReviewBusiness[];
  initialBlacklistTerms: string[];
  defaultCity?: string | null;
  defaultState?: string | null;
}) {
  const router = useRouter();
  // Skip terms are the source of truth for the "skip list" section.
  // Adding a term here also hides any matching businesses from the list.
  const [blacklistTerms, setBlacklistTerms] = useState<string[]>(
    initialBlacklistTerms
  );

  // Rows the athlete skipped this session — hidden immediately from
  // the visible list so the UI updates without waiting for the server
  // action to round-trip.
  const [skippedBusinessIds, setSkippedBusinessIds] = useState<Set<string>>(
    () => new Set()
  );

  // Search across business names (case-insensitive, substring).
  const [query, setQuery] = useState<string>("");

  const initiallySelected = useMemo(
    () => new Set(businesses.map((b) => b.business_id)),
    [businesses]
  );
  const [selected, setSelected] = useState<Set<string>>(initiallySelected);

  const [, startTransition] = useTransition();

  // Manual additions now come back through the server (the action calls
  // revalidatePath) + router.refresh() from the add handler.
  const allBusinesses = businesses;

  // Businesses after skip-term filter + row-skip filter. These are the
  // ones we send up on submit (via checked includes).
  const filterableBusinesses = useMemo(() => {
    const lowerTerms = blacklistTerms.map((t) => t.toLowerCase());
    return allBusinesses.filter((b) => {
      if (skippedBusinessIds.has(b.business_id)) return false;
      const lowerName = b.name.toLowerCase();
      return !lowerTerms.some((t) => t && lowerName.includes(t));
    });
  }, [allBusinesses, blacklistTerms, skippedBusinessIds]);

  // Visible (post-search) businesses — drives the grouping UI.
  const normalizedQuery = query.trim().toLowerCase();
  const visibleBusinesses = useMemo(() => {
    if (!normalizedQuery) return filterableBusinesses;
    return filterableBusinesses.filter((b) =>
      b.name.toLowerCase().includes(normalizedQuery)
    );
  }, [filterableBusinesses, normalizedQuery]);

  // Group by category from the visible list so empty categories vanish.
  const grouped = useMemo(() => {
    const map = new Map<string, ReviewBusiness[]>();
    for (const b of visibleBusinesses) {
      const arr = map.get(b.category) ?? [];
      arr.push(b);
      map.set(b.category, arr);
    }
    return Array.from(map.entries());
  }, [visibleBusinesses]);

  // Accordion open state. When search is active, auto-expand every
  // category that has matches so the athlete sees results immediately.
  const [manualOpenCategories, setManualOpenCategories] = useState<
    Set<string>
  >(() => new Set());

  const openCategories: Set<string> = useMemo(() => {
    if (normalizedQuery) {
      return new Set(grouped.map(([cat]) => cat));
    }
    return manualOpenCategories;
  }, [normalizedQuery, grouped, manualOpenCategories]);

  function toggleCategoryOpen(cat: string) {
    setManualOpenCategories((prev) => {
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

  // Count of checked AND visible businesses (drives submit label).
  const visibleSelectedCount = useMemo(() => {
    let n = 0;
    for (const b of filterableBusinesses)
      if (selected.has(b.business_id)) n++;
    return n;
  }, [filterableBusinesses, selected]);

  // ---- Skip actions ----------------------------------------------------
  function handleSkipBusiness(b: ReviewBusiness) {
    const term = b.name.trim().toLowerCase();
    setSkippedBusinessIds((prev) => {
      const next = new Set(prev);
      next.add(b.business_id);
      return next;
    });
    setBlacklistTerms((prev) =>
      prev.includes(term) ? prev : [...prev, term]
    );
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(b.business_id);
      return next;
    });

    // Persist — fire-and-forget. If it fails, the UI still reflects the
    // intent and the server-side submitReviewAction will catch up when
    // the athlete confirms (since the term is now in the form).
    const fd = new FormData();
    fd.set("business_id", b.business_id);
    fd.set("business_name", b.name);
    startTransition(() => {
      void skipBusinessAction(fd);
    });
  }

  function handleRemoveTerm(term: string) {
    setBlacklistTerms((prev) => prev.filter((t) => t !== term));
    const fd = new FormData();
    fd.set("term", term);
    startTransition(() => {
      void unskipTermAction(fd);
    });
  }

  function handleAddTerm(raw: string) {
    const t = raw.trim().toLowerCase();
    if (!t) return;
    setBlacklistTerms((prev) => (prev.includes(t) ? prev : [...prev, t]));
  }

  // ---- Places add --------------------------------------------------------
  // The server action upserts the business + target_lists row and
  // revalidates /signup/review. We also call router.refresh() so this
  // server-rendered component re-fetches and the row shows up below.
  function handlePlacesAdded() {
    router.refresh();
  }

  return (
    <div
      className="auth-form"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {/* Search --------------------------------------------------------- */}
      <label className="auth-form__label">
        <span>Search your list</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name…"
          autoComplete="off"
          spellCheck={false}
          className="auth-form__input"
          style={{ fontFamily: "var(--mono)" }}
        />
      </label>

      {/* Tally ---------------------------------------------------------- */}
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
          {visibleSelectedCount} of {filterableBusinesses.length} approved
          {filterableBusinesses.length !== allBusinesses.length ? (
            <span style={{ color: "var(--gold)", marginLeft: "0.5rem" }}>
              · {allBusinesses.length - filterableBusinesses.length} skipped
            </span>
          ) : null}
        </span>
      </div>

      {/* The main submit form wraps the checkbox accordions AND the
          hidden inputs that carry the final skip-list on submit. */}
      <form
        action={submitReviewAction}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Hidden inputs: one per blacklist term. The server action reads
            formData.getAll("blacklist_terms") and dedupes. */}
        {blacklistTerms.map((t) => (
          <input
            key={t}
            type="hidden"
            name="blacklist_terms"
            value={t}
          />
        ))}

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
            {normalizedQuery
              ? "No matches for that search."
              : "Every business is currently being skipped. Remove a term below to see results."}
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
                      <div
                        key={b.target_id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          gap: "0.85rem",
                          alignItems: "center",
                          padding: "0.75rem 0.9rem",
                          border: `2px solid ${
                            isSelected
                              ? "var(--green)"
                              : "var(--border-strong)"
                          }`,
                          background: isSelected
                            ? "var(--green-dim)"
                            : "var(--bg)",
                          borderRadius: "var(--r-sm)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            name="include"
                            value={b.business_id}
                            checked={isSelected}
                            onChange={() => toggle(b.business_id)}
                            style={{
                              accentColor: "var(--green)",
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                          />
                        </label>
                        <label
                          style={{ cursor: "pointer", minWidth: 0 }}
                          onClick={() => toggle(b.business_id)}
                        >
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
                            {b.city && b.state
                              ? `${b.city}, ${b.state}`
                              : "—"}
                            {b.rating !== null && b.rating !== undefined
                              ? ` · ★ ${b.rating.toFixed(1)}${
                                  b.ratings_count
                                    ? ` (${b.ratings_count})`
                                    : ""
                                }`
                              : ""}
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSkipBusiness(b)}
                          aria-label={`Skip ${b.name}`}
                          title="Skip — never pitch this business"
                          style={{
                            padding: "0.45rem 0.7rem",
                            border: "1px solid var(--border-strong)",
                            background: "var(--bg-soft)",
                            color: "var(--text-muted)",
                            fontFamily: "var(--cond)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderRadius: "var(--r-sm)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span aria-hidden>×</span>
                          Skip
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        <AddBusinessSearch
          addAction={addPlacesBusinessAction}
          defaultCity={defaultCity}
          defaultState={defaultState}
          onAdded={handlePlacesAdded}
        />

        <SkipListSection
          terms={blacklistTerms}
          defaultCity={defaultCity}
          defaultState={defaultState}
          onRemove={handleRemoveTerm}
          onAdd={handleAddTerm}
        />

        <SubmitButton count={visibleSelectedCount} />
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// Skip list — chips + add-by-name input
// ---------------------------------------------------------------------

function SkipListSection({
  terms,
  defaultCity,
  defaultState,
  onRemove,
  onAdd,
}: {
  terms: string[];
  defaultCity: string | null;
  defaultState: string | null;
  onRemove: (term: string) => void;
  onAdd: (term: string) => void;
}) {
  const [newTerm, setNewTerm] = useState("");

  function submit() {
    const t = newTerm.trim();
    if (!t) return;
    onAdd(t);
    setNewTerm("");
  }

  // The Places-driven skip search hits the server (which persists the
  // term to athletes.blacklist_terms) and ALSO fires onAddSkip so this
  // component can update the chip list without waiting for a refresh.
  function handlePlacesSkip(name: string) {
    onAdd(name);
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
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}
        >
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

      {/* Primary path: Places-driven search. Reuses the same dropdown
          pattern as "+ Add a business" at the top of the page. */}
      <AddBusinessSearch
        mode="skip"
        defaultCity={defaultCity}
        defaultState={defaultState}
        addSkipAction={skipBusinessByNameAction}
        onAddSkip={handlePlacesSkip}
      />

      {/* Fallback for businesses Google can't find — plain text input. */}
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
