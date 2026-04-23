"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveTargetsAction } from "@/app/signup/targets/actions";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const RADII = [5, 10, 25, 50] as const;

const CATEGORIES = [
  { v: "restaurants", label: "Restaurants & cafés", desc: "Local restaurants, family-owned spots" },
  { v: "fitness", label: "Gyms & fitness", desc: "Gyms, CrossFit, yoga, boutique studios" },
  { v: "beauty", label: "Beauty & salons", desc: "Hair salons, barbers, spas" },
  { v: "retail", label: "Local retail", desc: "Boutiques, sporting goods, specialty" },
  { v: "coffee", label: "Coffee shops", desc: "Cafés, roasters, specialty coffee" },
  { v: "auto", label: "Automotive", desc: "Detailing, repair, car washes" },
  { v: "other", label: "Other", desc: "We'll ask for specifics later" },
] as const;

type Category = (typeof CATEGORIES)[number]["v"];

const VALID_CATEGORIES: Set<string> = new Set(CATEGORIES.map((c) => c.v));

function coerceCategory(v: string): Category | null {
  return VALID_CATEGORIES.has(v) ? (v as Category) : null;
}

type Props = {
  defaultCities: { city: string; state: string }[];
  defaultRadius: number;
  defaultCategories: string[];
  error?: string;
};

type CityRow = { city: string; state: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending ? "Finding businesses…" : "Find my targets →"}
    </button>
  );
}

export function TargetsForm({
  defaultCities,
  defaultRadius,
  defaultCategories,
  error,
}: Props) {
  const [cities, setCities] = useState<CityRow[]>(
    defaultCities.length > 0
      ? defaultCities
      : [{ city: "", state: "" }]
  );
  const [radius, setRadius] = useState<number>(
    (RADII as readonly number[]).includes(defaultRadius) ? defaultRadius : 10
  );
  const [selected, setSelected] = useState<Set<Category>>(() => {
    const safeDefaults = defaultCategories
      .map(coerceCategory)
      .filter((c): c is Category => c !== null);
    const seed: Category[] =
      safeDefaults.length > 0 ? safeDefaults : ["restaurants", "fitness", "retail"];
    return new Set(seed);
  });

  function updateCity(idx: number, patch: Partial<CityRow>) {
    setCities((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
  }
  function addCity() {
    setCities((prev) => [...prev, { city: "", state: "" }]);
  }
  function removeCity(idx: number) {
    setCities((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function toggleCategory(v: Category) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  return (
    <form action={saveTargetsAction} className="auth-form">
      {error ? (
        <div
          role="alert"
          style={{
            padding: "0.85rem 1rem",
            border: "1px solid var(--red)",
            background: "rgba(255, 58, 87, 0.08)",
            borderRadius: "var(--r-sm)",
            fontSize: "0.9rem",
            color: "var(--red)",
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="auth-form__label" style={{ gap: "0.6rem" }}>
        <span>Pitch cities</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {cities.map((c, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr auto",
                gap: "0.5rem",
                alignItems: "stretch",
              }}
            >
              <input
                type="text"
                name="city"
                required
                value={c.city}
                onChange={(e) => updateCity(idx, { city: e.target.value })}
                placeholder="City"
                className="auth-form__input"
              />
              <select
                name="state"
                required
                value={c.state}
                onChange={(e) => updateCity(idx, { state: e.target.value })}
                className="auth-form__input auth-form__select"
              >
                <option value="" disabled>
                  State…
                </option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeCity(idx)}
                disabled={cities.length <= 1}
                aria-label="Remove city"
                style={{
                  padding: "0 0.9rem",
                  border: "2px solid var(--border-strong)",
                  background: "var(--bg-soft)",
                  color: cities.length <= 1 ? "var(--text-faint)" : "var(--text-dim)",
                  borderRadius: "var(--r-sm)",
                  fontFamily: "var(--mono)",
                  fontSize: "1.1rem",
                  cursor: cities.length <= 1 ? "not-allowed" : "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCity}
          style={{
            alignSelf: "flex-start",
            padding: "0.5rem 0.85rem",
            border: "1px dashed var(--border-strong)",
            background: "transparent",
            color: "var(--green)",
            fontFamily: "var(--cond)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius: "var(--r-sm)",
            cursor: "pointer",
          }}
        >
          + Add another city
        </button>
      </div>

      <label className="auth-form__label">
        <span>Radius · applies to all cities</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {RADII.map((r) => {
            const active = radius === r;
            return (
              <button
                type="button"
                key={r}
                onClick={() => setRadius(r)}
                aria-pressed={active}
                style={{
                  padding: "0.5rem 0.95rem",
                  border: `2px solid ${active ? "var(--green)" : "var(--border-strong)"}`,
                  background: active ? "var(--green-dim)" : "var(--bg-soft)",
                  color: active ? "var(--green)" : "var(--text-dim)",
                  fontFamily: "var(--cond)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "var(--r-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {r} mi
              </button>
            );
          })}
        </div>
        <input type="hidden" name="radius" value={radius} required />
      </label>

      <div className="auth-form__label" style={{ gap: "0.55rem" }}>
        <span>Business categories · pick all that fit</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {CATEGORIES.map((cat) => {
            const active = selected.has(cat.v);
            return (
              <label
                key={cat.v}
                style={{
                  display: "flex",
                  gap: "0.85rem",
                  padding: "0.85rem 1rem",
                  border: `2px solid ${active ? "var(--green)" : "var(--border-strong)"}`,
                  background: active ? "var(--green-dim)" : "var(--bg-soft)",
                  borderRadius: "var(--r-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="checkbox"
                  name="category"
                  value={cat.v}
                  checked={active}
                  onChange={() => toggleCategory(cat.v)}
                  style={{ marginTop: "0.2rem", accentColor: "var(--green)" }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--cond)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      color: active ? "var(--green)" : "var(--text)",
                    }}
                  >
                    {cat.label}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {cat.desc}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        We&apos;ll search Google for local businesses in your categories — this
        can take 10–30 seconds. You&apos;ll approve the list on the next screen.
      </p>

      <SubmitButton />
    </form>
  );
}
