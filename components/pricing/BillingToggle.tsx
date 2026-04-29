"use client";

export type BillingPeriod = "monthly" | "yearly";

export function BillingToggle({
  value,
  onChange,
  savingsLabel = "Save up to 58%",
}: {
  value: BillingPeriod;
  onChange: (next: BillingPeriod) => void;
  savingsLabel?: string;
}) {
  return (
    <div className="billing-toggle-wrap">
      <div className="billing-toggle" role="tablist" aria-label="Billing period">
        <button
          type="button"
          role="tab"
          aria-selected={value === "monthly"}
          className={`billing-toggle__btn ${
            value === "monthly" ? "billing-toggle__btn--active" : ""
          }`}
          onClick={() => onChange("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={value === "yearly"}
          className={`billing-toggle__btn ${
            value === "yearly" ? "billing-toggle__btn--active" : ""
          }`}
          onClick={() => onChange("yearly")}
        >
          Yearly
        </button>
      </div>
      <span className="billing-toggle__savings">{savingsLabel}</span>
    </div>
  );
}
