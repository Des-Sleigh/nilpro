"use client";

import { useEffect, useRef, useState } from "react";

export type PlacesSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  city: string | null;
  state: string | null;
  primaryType: string | null;
  rating: number | null;
};

type AddActionResult = { ok: true } | { ok: false; error: string };
type AddAction = (
  placeId: string,
  result: PlacesSearchResult,
  categoryDefault?: string
) => Promise<AddActionResult>;

/** Server action used when the search is in skip mode — accepts the
 *  raw business name and persists it to the athlete's blacklist_terms. */
type AddSkipAction = (
  name: string
) => Promise<AddActionResult>;

type Props = {
  /**
   * Mode controls the result-row CTA.
   *  - "approve" (default): clicking "+ Add" calls `addAction` to upsert
   *    the business and approve it onto the target list.
   *  - "skip": clicking "+ Skip" calls `onAddSkip` (or `addSkipAction`)
   *    with the result name to add it to the athlete's permanent skip
   *    list. Used by the bottom-of-review "skip a business" affordance.
   */
  mode?: "approve" | "skip";
  /** Required when mode="approve". Server action to add the business. */
  addAction?: AddAction;
  /** Optional server action used when mode="skip". Mirrors addAction
   *  semantics but only needs the business name. */
  addSkipAction?: AddSkipAction;
  /** Optional in-component callback fired after a skip add succeeds —
   *  hosts use it to mutate local state (e.g. add a chip). */
  onAddSkip?: (name: string) => void;
  /** Optional default city to bias the search (first pitch city). */
  defaultCity?: string | null;
  /** Optional default state to bias the search. */
  defaultState?: string | null;
  /**
   * Default NILPro category id to use when the Google primaryType isn't
   * one we recognize. Defaults to professional_services server-side.
   */
  categoryDefault?: string;
  /** Optional afterAdd hook for the host (e.g. refetch). */
  onAdded?: (result: PlacesSearchResult) => void;
};

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

export function AddBusinessSearch({
  mode = "approve",
  addAction,
  addSkipAction,
  onAddSkip,
  defaultCity = null,
  defaultState = null,
  categoryDefault,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlacesSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const isSkipMode = mode === "skip";
  const triggerLabelClosed = isSkipMode
    ? "+ Skip a business"
    : "+ Add a business";
  const cellAddLabel = isSkipMode ? "+ Skip" : "+ Add";
  const cellAddingLabel = isSkipMode ? "Skipping…" : "Adding…";
  const cellAddedLabel = isSkipMode ? "Skipped ✓" : "Added ✓";

  // Track in-flight fetches so stale responses can be discarded.
  const reqSeq = useRef(0);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced effect — run a search whenever `query` changes.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_CHARS) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }

    const mySeq = ++reqSeq.current;
    const t = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const params = new URLSearchParams();
        params.set("q", q);
        if (defaultCity) params.set("city", defaultCity);
        if (defaultState) params.set("state", defaultState);

        const res = await fetch(`/api/places/search?${params.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (mySeq !== reqSeq.current) return; // stale

        if (res.status === 429) {
          setSearchError("Slow down a sec — try again in a moment.");
          setResults([]);
          setSearching(false);
          return;
        }

        if (!res.ok) {
          setSearchError("Search failed — try again.");
          setResults([]);
          setSearching(false);
          return;
        }

        const json = (await res.json()) as { results?: PlacesSearchResult[] };
        if (mySeq !== reqSeq.current) return;
        setResults(Array.isArray(json.results) ? json.results : []);
        setSearching(false);
      } catch {
        if (mySeq !== reqSeq.current) return;
        setSearchError("Couldn't reach Google right now.");
        setResults([]);
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [query, defaultCity, defaultState]);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  async function handleAdd(r: PlacesSearchResult) {
    if (addingId) return;
    setAddingId(r.placeId);
    setAddError(null);
    try {
      let res: AddActionResult;
      if (isSkipMode) {
        if (addSkipAction) {
          res = await addSkipAction(r.name);
        } else if (onAddSkip) {
          // Pure client-side fallback — the host owns persistence.
          onAddSkip(r.name);
          res = { ok: true };
        } else {
          res = { ok: false, error: "Skip handler missing." };
        }
      } else {
        if (!addAction) {
          res = { ok: false, error: "Add handler missing." };
        } else {
          res = await addAction(r.placeId, r, categoryDefault);
        }
      }

      if (res.ok) {
        setAddedId(r.placeId);
        if (isSkipMode) {
          // Notify host for local-state UI updates regardless of which
          // path persisted the term.
          if (addSkipAction) onAddSkip?.(r.name);
        } else {
          onAdded?.(r);
        }
        // Brief confirmation, then clear the search.
        if (addedTimer.current) clearTimeout(addedTimer.current);
        addedTimer.current = setTimeout(() => {
          setQuery("");
          setResults([]);
          setAddedId(null);
        }, 900);
      } else {
        setAddError(res.error);
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Couldn't add that.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div
      style={{
        border: "1px dashed var(--border-strong)",
        background: "var(--bg-soft)",
        borderRadius: "var(--r-sm)",
        padding: open ? "1rem" : "0.65rem 0.9rem",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--green)",
          fontFamily: "var(--cond)",
          fontSize: "0.9rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {open ? "× Cancel" : triggerLabelClosed}
      </button>

      {open ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            marginTop: "0.85rem",
          }}
        >
          <label className="auth-form__label">
            <span>
              {isSkipMode ? "Find a business to skip" : "Search for a business"}
              {defaultCity ? ` in ${defaultCity}${defaultState ? `, ${defaultState}` : ""}` : ""}
            </span>
            <input
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Joe's Pizza…"
              className="auth-form__input"
              style={{ fontFamily: "var(--mono)" }}
            />
          </label>

          {addError ? (
            <div
              role="alert"
              style={{
                padding: "0.55rem 0.75rem",
                border: "1px solid var(--red)",
                background: "rgba(255, 58, 87, 0.08)",
                borderRadius: "var(--r-sm)",
                fontSize: "0.82rem",
                color: "var(--red)",
              }}
            >
              {addError}
            </div>
          ) : null}

          {searchError ? (
            <div
              style={{
                padding: "0.55rem 0.75rem",
                border: "1px solid var(--border-strong)",
                background: "var(--bg)",
                borderRadius: "var(--r-sm)",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              {searchError}
            </div>
          ) : null}

          {searching ? (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.74rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Searching…
            </div>
          ) : null}

          {!searching && query.trim().length >= MIN_CHARS && results.length === 0 && !searchError ? (
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              No matches on Google. Try a different name, or refine the city.
            </div>
          ) : null}

          {results.length > 0 ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                borderRadius: "var(--r-sm)",
                overflow: "hidden",
              }}
            >
              {results.map((r) => {
                const isAdding = addingId === r.placeId;
                const isAdded = addedId === r.placeId;
                return (
                  <li
                    key={r.placeId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.65rem 0.85rem",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--cond)",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginTop: "0.15rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.formattedAddress ?? "—"}
                        {typeof r.rating === "number"
                          ? ` · ★ ${r.rating.toFixed(1)}`
                          : ""}
                      </div>
                    </div>
                    {isAdded ? (
                      <span
                        style={{
                          fontFamily: "var(--cond)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--green)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cellAddedLabel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(r)}
                        disabled={isAdding || Boolean(addingId)}
                        className="btn btn--ghost btn--sm"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {isAdding ? cellAddingLabel : cellAddLabel}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
