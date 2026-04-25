"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveDealMenuAction } from "@/app/signup/deal-menu/actions";

type Defaults = {
  cashEnabled: boolean;
  cashMin: number | null;
  gearEnabled: boolean;
  productEnabled: boolean;
  appearanceEnabled: boolean;
  appearanceMin: number | null;
};

type ActionFn = (formData: FormData) => void | Promise<void>;

function SubmitButton({ label }: { label: string }) {
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
        label
      )}
    </button>
  );
}

export function DealMenuForm({
  defaults,
  error,
  action,
  submitLabel = "Continue →",
}: {
  defaults: Defaults;
  error?: string;
  /** Server action to submit to. Defaults to the signup flow action. */
  action?: ActionFn;
  submitLabel?: string;
}) {
  const [cash, setCash] = useState(defaults.cashEnabled);
  const [cashMin, setCashMin] = useState<string>(
    defaults.cashMin !== null ? String(defaults.cashMin) : "50"
  );
  const [gear, setGear] = useState(defaults.gearEnabled);
  const [product, setProduct] = useState(defaults.productEnabled);
  const [appearance, setAppearance] = useState(defaults.appearanceEnabled);
  const [appearanceMin, setAppearanceMin] = useState<string>(
    defaults.appearanceMin !== null ? String(defaults.appearanceMin) : "100"
  );

  const onCount =
    Number(cash) + Number(gear) + Number(product) + Number(appearance);

  return (
    <form action={action ?? saveDealMenuAction} className="auth-form">
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.6rem 1rem",
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
          Deal types
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: onCount > 0 ? "var(--green)" : "var(--text-muted)",
            fontWeight: 700,
          }}
        >
          {onCount} OF 4 ON
        </span>
      </div>

      <DealRow
        checked={cash}
        onToggle={() => setCash((v) => !v)}
        label="Cash per post"
        desc="IG or TikTok post — you approve every piece of content"
        inputName="cash_per_post_enabled"
      >
        {cash ? (
          <DollarInput
            value={cashMin}
            onChange={setCashMin}
            name="cash_per_post_min"
            hint="Minimum per post"
          />
        ) : null}
      </DealRow>

      <DealRow
        checked={gear}
        onToggle={() => setGear((v) => !v)}
        label="Free gear & products"
        desc="Apparel, sports equipment, sneakers, gear from local sponsors"
        inputName="gear_enabled"
      />

      <DealRow
        checked={product}
        onToggle={() => setProduct((v) => !v)}
        label="Free services & meals"
        desc="Meals, gym access, haircuts, recovery sessions, etc."
        inputName="product_trade_enabled"
      />

      <DealRow
        checked={appearance}
        onToggle={() => setAppearance((v) => !v)}
        label="In-store appearances"
        desc="1–2 hour visit · meet customers · photos / video"
        inputName="appearance_enabled"
      >
        {appearance ? (
          <DollarInput
            value={appearanceMin}
            onChange={setAppearanceMin}
            name="appearance_min"
            hint="Minimum per appearance"
          />
        ) : null}
      </DealRow>

      <div
        style={{
          padding: "1rem 1.15rem",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--gold)",
            fontWeight: 700,
            marginBottom: "0.4rem",
          }}
        >
          ⚑ REMINDER
        </div>
        <div style={{ fontSize: "0.87rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
          Your menu goes to every business we pitch. Businesses can counter with
          different terms — counters land in your dashboard and you decide
          whether to accept.
        </div>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function DealRow({
  checked,
  onToggle,
  label,
  desc,
  inputName,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  desc: string;
  inputName: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "0.95rem 1rem",
        border: `2px solid ${checked ? "var(--green)" : "var(--border-strong)"}`,
        background: checked ? "var(--green-dim)" : "var(--bg-soft)",
        borderRadius: "var(--r-sm)",
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <label
        style={{
          display: "flex",
          gap: "0.85rem",
          alignItems: "flex-start",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          name={inputName}
          checked={checked}
          onChange={onToggle}
          style={{ marginTop: "0.25rem", accentColor: "var(--green)", width: "18px", height: "18px" }}
        />
        <div>
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: "1rem",
              fontWeight: 700,
              color: checked ? "var(--green)" : "var(--text)",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {desc}
          </div>
        </div>
      </label>
      {children}
    </div>
  );
}

function DollarInput({
  value,
  onChange,
  name,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  name: string;
  hint: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginLeft: "2.3rem" }}>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {hint}
      </span>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0 0.9rem",
            background: "var(--bg-soft)",
            border: "2px solid #000",
            borderRight: "none",
            boxShadow: "0 0 0 1px var(--border-strong), 0 2px 0 #000",
            borderTopLeftRadius: "var(--r-sm)",
            borderBottomLeftRadius: "var(--r-sm)",
            color: "var(--green)",
            fontFamily: "var(--mono)",
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          className="auth-form__input"
          style={{
            flex: 1,
            maxWidth: "12rem",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            fontFamily: "var(--mono)",
          }}
        />
      </div>
    </div>
  );
}
