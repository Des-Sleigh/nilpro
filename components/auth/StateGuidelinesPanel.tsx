"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { StateRules } from "@/lib/states/stateRules";

type Props = {
  rules: StateRules;
  markdown: string | null;
  showAcknowledgeCheckbox?: boolean;
  acknowledged?: boolean;
  onAcknowledgeChange?: (checked: boolean) => void;
  /** Hidden form-field name for the acknowledgment value (so it submits with the form). */
  acknowledgeFieldName?: string;
};

const STATUS_BADGE: Record<
  StateRules["hsNilAllowed"],
  { label: string; color: string; bg: string }
> = {
  on: { label: "HS NIL permitted", color: "var(--green)", bg: "var(--green-dim)" },
  partial: {
    label: "Permitted with restrictions",
    color: "var(--gold)",
    bg: "rgba(255, 184, 0, 0.12)",
  },
  off: {
    label: "HS NIL not yet permitted",
    color: "var(--red)",
    bg: "rgba(255, 58, 87, 0.12)",
  },
};

export function StateGuidelinesPanel({
  rules,
  markdown,
  showAcknowledgeCheckbox = false,
  acknowledged = false,
  onAcknowledgeChange,
  acknowledgeFieldName,
}: Props) {
  const badge = STATUS_BADGE[rules.hsNilAllowed];

  return (
    <div className="state-guidelines">
      <div className="state-guidelines__head">
        <div>
          <span className="label">{rules.code} — NIL GUIDELINES</span>
          <h3 className="state-guidelines__title">{rules.name}</h3>
        </div>
        <span
          className="state-guidelines__badge"
          style={{
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.color}`,
          }}
        >
          {badge.label}
        </span>
      </div>

      {markdown ? (
        <div className="state-guidelines__body markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      ) : (
        <FallbackRules rules={rules} />
      )}

      {showAcknowledgeCheckbox && (
        <label className="state-guidelines__ack">
          <input
            type="checkbox"
            name={acknowledgeFieldName}
            value="true"
            checked={acknowledged}
            onChange={(e) => onAcknowledgeChange?.(e.target.checked)}
            required
            className="state-guidelines__ack-input"
          />
          <span>
            I&apos;ve reviewed {rules.name}&apos;s NIL rules above and understand
            that complying with my state&apos;s requirements is{" "}
            <strong>my responsibility</strong>. NILPro provides the rules,
            templates, and reminders — I&apos;m the one who acts on them.
          </span>
        </label>
      )}
    </div>
  );
}

/** Fallback when no markdown file exists for the state — show structured data. */
function FallbackRules({ rules }: { rules: StateRules }) {
  if (!rules.documented) {
    return (
      <div className="state-guidelines__stub">
        <strong>Documentation in progress.</strong>
        <p>
          Detailed rules for {rules.name} are still being verified. Treat
          parental co-signature as required and confirm specifics with your
          school&apos;s athletic director before signing any deal.
        </p>
      </div>
    );
  }

  return (
    <div className="state-guidelines__fallback">
      <h4>Key requirements</h4>
      <ul>
        <li>
          <strong>Parental co-signature on deals:</strong>{" "}
          {rules.parentalCosignOnDeals
            ? "required (you must be 18+ or a parent must sign)"
            : "not required"}
        </li>
        <li>
          <strong>School disclosure:</strong>{" "}
          {rules.schoolDisclosureRequired
            ? "required after signing a deal"
            : "not required at the state level"}
        </li>
        {rules.notarization !== "none" && (
          <li>
            <strong>Notarization:</strong> may be required for minor contracts.
          </li>
        )}
      </ul>
      {rules.notes && <p>{rules.notes}</p>}
      {rules.sourceLabel && rules.sourceUrl && (
        <p className="state-guidelines__source">
          Source: <a href={rules.sourceUrl} target="_blank" rel="noopener noreferrer">{rules.sourceLabel}</a>
        </p>
      )}
    </div>
  );
}
