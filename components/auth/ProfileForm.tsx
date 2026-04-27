"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfileAction } from "@/app/signup/profile/actions";

const LEVELS = [
  { v: "HS", label: "High school" },
  { v: "JUCO", label: "JUCO" },
  { v: "NAIA", label: "NAIA" },
  { v: "D3", label: "D3" },
  { v: "D2", label: "D2" },
  { v: "D1", label: "D1" },
  { v: "Club", label: "Club" },
] as const;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

function computeAge(dob: string): number | null {
  if (!dob) return null;
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

/**
 * Dynamic Sport / Position rows. The first row is required; athletes
 * can add more sport+position pairs and remove any row that isn't the
 * only one. Each row submits as repeated `sports` / `positions` fields,
 * which the action reads with `formData.getAll(...)`.
 */
function SportRowsField({
  defaults,
}: {
  defaults?: { sport: string; position: string }[];
}) {
  const seed =
    defaults && defaults.length > 0
      ? defaults
      : [{ sport: "", position: "" }];
  const [rows, setRows] = useState(seed);

  function update(i: number, field: "sport" | "position", value: string) {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  }
  function addRow() {
    setRows((prev) => [...prev, { sport: "", position: "" }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
      {rows.map((r, i) => {
        const onlyRow = rows.length === 1;
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "0.85rem",
              alignItems: "end",
            }}
          >
            <label className="auth-form__label">
              <span>{i === 0 ? "Sport" : `Sport ${i + 1}`}</span>
              <input
                type="text"
                name="sports"
                required={i === 0}
                value={r.sport}
                onChange={(e) => update(i, "sport", e.target.value)}
                placeholder="Soccer, football, track…"
                className="auth-form__input"
              />
            </label>
            <label className="auth-form__label">
              <span>Position (optional)</span>
              <input
                type="text"
                name="positions"
                value={r.position}
                onChange={(e) => update(i, "position", e.target.value)}
                placeholder="Midfielder, QB…"
                className="auth-form__input"
              />
            </label>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={onlyRow}
              aria-label={`Remove sport ${i + 1}`}
              style={{
                padding: "0.55rem 0.7rem",
                border: "1px solid var(--border-strong)",
                background: "var(--bg-soft)",
                color: onlyRow ? "var(--text-muted)" : "var(--text-dim)",
                fontFamily: "var(--mono)",
                fontSize: "1rem",
                lineHeight: 1,
                borderRadius: "var(--r-sm)",
                cursor: onlyRow ? "not-allowed" : "pointer",
                opacity: onlyRow ? 0.4 : 1,
                height: "2.45rem",
              }}
            >
              ×
            </button>
          </div>
        );
      })}
      <div>
        <button
          type="button"
          onClick={addRow}
          style={{
            padding: "0.45rem 0.85rem",
            border: "1px dashed var(--border-strong)",
            background: "transparent",
            color: "var(--text-dim)",
            fontFamily: "var(--cond)",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius: "var(--r-sm)",
            cursor: "pointer",
          }}
        >
          + Add another sport
        </button>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending ? "Saving…" : "Continue →"}
    </button>
  );
}

export function ProfileForm({ error }: { error?: string }) {
  const [level, setLevel] = useState<string>("");
  const [dob, setDob] = useState<string>("");

  const age = useMemo(() => computeAge(dob), [dob]);
  const isMinor = age !== null && age < 18 && age >= 13;

  const thisYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 10 }, (_, i) => thisYear + i - 2);

  return (
    <form action={saveProfileAction} className="auth-form">
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

      <div className="form-grid-2">
        <label className="auth-form__label">
          <span>First name</span>
          <input
            type="text"
            name="first_name"
            required
            autoComplete="given-name"
            className="auth-form__input"
          />
        </label>
        <label className="auth-form__label">
          <span>Last name</span>
          <input
            type="text"
            name="last_name"
            required
            autoComplete="family-name"
            className="auth-form__input"
          />
        </label>
      </div>

      <label className="auth-form__label">
        <span>Level</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {LEVELS.map((l) => {
            const active = level === l.v;
            return (
              <button
                type="button"
                key={l.v}
                onClick={() => setLevel(l.v)}
                className="level-chip"
                aria-pressed={active}
                style={{
                  padding: "0.5rem 0.9rem",
                  border: `2px solid ${active ? "var(--green)" : "var(--border-strong)"}`,
                  background: active ? "var(--green-dim)" : "var(--bg-soft)",
                  color: active ? "var(--green)" : "var(--text-dim)",
                  fontFamily: "var(--cond)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "var(--r-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="level" value={level} required />
      </label>

      <SportRowsField />

      <label className="auth-form__label">
        <span>School</span>
        <input
          type="text"
          name="school"
          required
          placeholder="Full school name"
          className="auth-form__input"
        />
      </label>

      <div className="form-grid-2">
        <label className="auth-form__label">
          <span>Date of birth</span>
          <input
            type="date"
            name="date_of_birth"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="auth-form__input"
          />
        </label>
        <label className="auth-form__label">
          <span>Graduation year</span>
          <select
            name="graduation_year"
            required
            defaultValue=""
            className="auth-form__input auth-form__select"
          >
            <option value="" disabled>
              Select…
            </option>
            {gradYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-grid-2-1">
        <label className="auth-form__label">
          <span>Hometown city</span>
          <input
            type="text"
            name="hometown_city"
            required
            autoComplete="address-level2"
            className="auth-form__input"
          />
        </label>
        <label className="auth-form__label">
          <span>State</span>
          <select
            name="hometown_state"
            required
            defaultValue=""
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
        </label>
      </div>

      {isMinor ? (
        <div
          style={{
            padding: "1.25rem",
            border: "1px solid var(--gold)",
            background: "rgba(255, 184, 0, 0.08)",
            borderRadius: "var(--r-md)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 700,
            }}
          >
            ● Under 18 — parent info required
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-dim)", margin: 0 }}>
            We&apos;ll send your parent a link to co-approve your account and any
            deals you agree to.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr",
              gap: "0.85rem",
            }}
          >
            <label className="auth-form__label">
              <span>Parent first name</span>
              <input
                type="text"
                name="parent_first_name"
                required={isMinor}
                className="auth-form__input"
              />
            </label>
            <label className="auth-form__label">
              <span>Parent email</span>
              <input
                type="email"
                name="parent_email"
                required={isMinor}
                inputMode="email"
                className="auth-form__input"
              />
            </label>
          </div>
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
