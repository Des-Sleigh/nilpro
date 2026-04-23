"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfileSettingsAction } from "@/app/settings/profile/actions";
import { PhotoForm } from "@/components/auth/PhotoForm";

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

export type SettingsProfileDefaults = {
  firstName: string;
  lastName: string;
  level: string;
  sport: string;
  position: string | null;
  school: string;
  graduationYear: number | null;
  hometownCity: string | null;
  hometownState: string | null;
  instagramHandle: string;
  tiktokHandle: string;
  profilePhotoUrl: string | null;
  userId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary btn--lg"
      style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
    >
      {pending ? "Saving…" : "Save changes →"}
    </button>
  );
}

export function SettingsProfileForm({
  defaults,
  error,
  saved,
}: {
  defaults: SettingsProfileDefaults;
  error?: string;
  saved?: boolean;
}) {
  const [level, setLevel] = useState<string>(defaults.level);

  const thisYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 10 }, (_, i) => thisYear + i - 2);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
    >
      <section>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontWeight: 700,
            marginBottom: "0.85rem",
          }}
        >
          Profile photo
        </div>
        <PhotoForm
          userId={defaults.userId}
          initialPhotoUrl={defaults.profilePhotoUrl}
          nextHref="/settings/profile?saved=1"
          allowSkip={false}
          submitLabel="Save photo →"
        />
      </section>

      <form action={saveProfileSettingsAction} className="auth-form">
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
        {saved ? (
          <div
            role="status"
            style={{
              padding: "0.85rem 1rem",
              border: "1px solid var(--green)",
              background: "var(--green-dim)",
              borderRadius: "var(--r-sm)",
              fontSize: "0.9rem",
              color: "var(--green)",
            }}
          >
            Saved.
          </div>
        ) : null}

        <div className="form-grid-2">
          <label className="auth-form__label">
            <span>First name</span>
            <input
              type="text"
              name="first_name"
              required
              defaultValue={defaults.firstName}
              className="auth-form__input"
            />
          </label>
          <label className="auth-form__label">
            <span>Last name</span>
            <input
              type="text"
              name="last_name"
              required
              defaultValue={defaults.lastName}
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
                  aria-pressed={active}
                  style={{
                    padding: "0.5rem 0.9rem",
                    border: `2px solid ${
                      active ? "var(--green)" : "var(--border-strong)"
                    }`,
                    background: active
                      ? "var(--green-dim)"
                      : "var(--bg-soft)",
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

        <div className="form-grid-2">
          <label className="auth-form__label">
            <span>Sport</span>
            <input
              type="text"
              name="sport"
              required
              defaultValue={defaults.sport}
              className="auth-form__input"
            />
          </label>
          <label className="auth-form__label">
            <span>Position (optional)</span>
            <input
              type="text"
              name="position"
              defaultValue={defaults.position ?? ""}
              className="auth-form__input"
            />
          </label>
        </div>

        <label className="auth-form__label">
          <span>School</span>
          <input
            type="text"
            name="school"
            required
            defaultValue={defaults.school}
            className="auth-form__input"
          />
        </label>

        <div className="form-grid-2">
          <label className="auth-form__label">
            <span>Graduation year</span>
            <select
              name="graduation_year"
              required
              defaultValue={
                defaults.graduationYear !== null
                  ? String(defaults.graduationYear)
                  : ""
              }
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
          <div />
        </div>

        <div className="form-grid-2-1">
          <label className="auth-form__label">
            <span>Hometown city</span>
            <input
              type="text"
              name="hometown_city"
              required
              defaultValue={defaults.hometownCity ?? ""}
              className="auth-form__input"
            />
          </label>
          <label className="auth-form__label">
            <span>State</span>
            <select
              name="hometown_state"
              required
              defaultValue={defaults.hometownState ?? ""}
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

        <label className="auth-form__label">
          <span>Instagram handle</span>
          <input
            type="text"
            name="instagram_handle"
            required
            defaultValue={defaults.instagramHandle}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="auth-form__input"
            style={{ fontFamily: "var(--mono)" }}
          />
        </label>

        <label className="auth-form__label">
          <span>TikTok handle (optional)</span>
          <input
            type="text"
            name="tiktok_handle"
            defaultValue={defaults.tiktokHandle}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="auth-form__input"
            style={{ fontFamily: "var(--mono)" }}
          />
        </label>

        <SubmitButton />
      </form>
    </div>
  );
}
