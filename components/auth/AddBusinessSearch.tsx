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

type Props = {
  /** Server action that persists the business to the target list. */
  addAction: AddAction;
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
  addAction,
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
      const res = await addAction(r.placeId, r, categoryDefault);
      if (res.ok) {
        setAddedId(r.placeId);
        onAdded?.(r);
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
        {open ? "× Cancel" : "+ Add a business"}
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
              Search for a business
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
                        Added ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(r)}
                        disabled={isAdding || Boolean(addingId)}
                        className="btn btn--ghost btn--sm"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {isAdding ? "Adding…" : "+ Add"}
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
