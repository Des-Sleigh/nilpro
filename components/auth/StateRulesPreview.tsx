"use client";

import Link from "next/link";
import { rulesFor } from "@/lib/states/stateRules";

export function StateRulesPreview({ stateCode }: { stateCode: string }) {
  const rules = rulesFor(stateCode);
  if (!rules) return null;

  const badge =
    rules.hsNilAllowed === "on"
      ? { label: "HS NIL permitted", color: "var(--green)", bg: "var(--green-dim)" }
      : rules.hsNilAllowed === "partial"
      ? {
          label: "Permitted with restrictions",
          color: "var(--gold)",
          bg: "rgba(255, 184, 0, 0.12)",
        }
      : {
          label: "HS NIL not yet permitted",
          color: "var(--red)",
          bg: "rgba(255, 58, 87, 0.12)",
        };

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "1rem 1.1rem",
        border: "1px solid var(--border)",
        background: "var(--bg-soft)",
        borderRadius: "var(--r-md)",
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {rules.code} — {rules.name} NIL rules
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.25rem 0.55rem",
            borderRadius: "var(--r-pill)",
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.color}`,
            whiteSpace: "nowrap",
          }}
        >
          {badge.label}
        </span>
      </div>

      {rules.documented ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            fontSize: "0.85rem",
            color: "var(--text-dim)",
            lineHeight: 1.5,
          }}
        >
          <li>
            <strong style={{ color: "var(--text)" }}>Parent co-signature on deals:</strong>{" "}
            {rules.parentalCosignOnDeals ? "required (you must be 18+ or a parent must sign)" : "not required"}
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>Banned deal categories:</strong>{" "}
            {rules.bannedCategories.slice(0, 4).join(", ")}
            {rules.bannedCategories.length > 4 ? `, +${rules.bannedCategories.length - 4} more` : ""}
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>School disclosure:</strong>{" "}
            {rules.schoolDisclosureRequired ? "required after signing a deal" : "not required at the state level"}
          </li>
          {rules.notarization !== "none" && (
            <li>
              <strong style={{ color: "var(--gold)" }}>Heads up:</strong>{" "}
              minor contracts in this state may require notarization for higher-value deals.
            </li>
          )}
        </ul>
      ) : (
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-dim)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          We have your eligibility flag for {rules.name}, but the full rule
          readout is still being verified. Treat parental co-signature as
          required and confirm specifics with your school&apos;s athletic
          director before signing any deal.
        </p>
      )}

      <Link
        href={`/state-rules?state=${rules.code}`}
        target="_blank"
        rel="noopener"
        style={{
          fontFamily: "var(--cond)",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--green)",
          textDecoration: "none",
          alignSelf: "flex-start",
        }}
      >
        See full {rules.name} rules →
      </Link>
    </div>
  );
}
