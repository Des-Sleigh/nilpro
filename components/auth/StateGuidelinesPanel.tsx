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

      {/* Plain-English "what this means for you" — always shows, sourced
          from the structured rules data. The legal-doc markdown below is
          for athletes/parents who want the full readout. */}
      <QuickTakeaway rules={rules} />

      {markdown && rules.hsNilAllowed !== "off" && (
        <details className="state-guidelines__details">
          <summary>Read the full {rules.name} guidelines</summary>
          <div className="state-guidelines__body markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        </details>
      )}

      {markdown && rules.hsNilAllowed === "off" && (
        <div className="state-guidelines__body markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
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

/** Plain-English summary of what the structured rule fields mean for an
 *  athlete and their parent. Lives above the legal-doc markdown so the
 *  most important takeaways aren't buried. Green parenthetical hints
 *  translate jargon ("notarization required") into action ("go to a bank
 *  with your parent — most do free notary"). */
function QuickTakeaway({ rules }: { rules: StateRules }) {
  // For "off" states, skip the rules summary — the markdown above explains
  // why HS NIL isn't permitted, no point listing rules that don't apply.
  if (rules.hsNilAllowed === "off") {
    return null;
  }

  return (
    <div className="state-guidelines__quick">
      <h4 className="state-guidelines__quick-title">
        What this means for you
      </h4>
      <ul className="state-guidelines__quick-list">
        <li>
          <strong>Parent co-signs every deal:</strong>{" "}
          {rules.parentalCosignOnDeals ? (
            <>
              required <Hint>your parent has to sign the contract too — they&apos;re a party to the deal, not just giving permission</Hint>
            </>
          ) : (
            <>
              not required <Hint>but recommended — having a parent sign reduces legal risk for everyone</Hint>
            </>
          )}
        </li>

        <li>
          <strong>Notarization:</strong>{" "}
          {rules.notarization === "required" ? (
            <>
              required <Hint>your parent has to sign in front of a notary — most banks and the post office do this for free; takes 5 minutes</Hint>
            </>
          ) : rules.notarization === "minor-only" ? (
            <>
              may apply for bigger deals <Hint>if a deal is over a few hundred dollars, ask if it needs notarization — banks and the post office do it free</Hint>
            </>
          ) : (
            <>
              not required <Hint>regular signature on the contract is fine</Hint>
            </>
          )}
        </li>

        <li>
          <strong>Tell your school after signing:</strong>{" "}
          {rules.schoolDisclosureRequired ? (
            <>
              required <Hint>email your athletic director with the deal details — NILPro gives you a copy-paste template at deal-sign time</Hint>
            </>
          ) : (
            <>
              not required by your state <Hint>still smart to give your AD a heads-up so they&apos;re not blindsided</Hint>
            </>
          )}
        </li>

        <li>
          <strong>School pre-approval before signing:</strong>{" "}
          {rules.schoolApprovalRequired ? (
            <>
              required <Hint>your athletic director has to OK the deal BEFORE you sign — talk to them first</Hint>
            </>
          ) : (
            <>
              not required <Hint>you can sign without pre-clearance, then disclose after if needed</Hint>
            </>
          )}
        </li>

        <li>
          <strong>Off-limits deal types:</strong>{" "}
          <Hint>
            no{" "}
            {rules.bannedCategories.slice(0, 4).join(", ")}
            {rules.bannedCategories.length > 4
              ? `, +${rules.bannedCategories.length - 4} more — full list in the guidelines below`
              : ""}
          </Hint>
        </li>
      </ul>
    </div>
  );
}

/** Green parenthetical plain-English hint. */
function Hint({ children }: { children: React.ReactNode }) {
  return <span className="state-guidelines__hint">({children})</span>;
}
