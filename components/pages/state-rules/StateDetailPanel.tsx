import type { StateRules } from "@/lib/states/stateRules";

function YesNo({ value }: { value: boolean }) {
  return (
    <span className={`sr-yn ${value ? "sr-yn--yes" : "sr-yn--no"}`}>
      {value ? "Yes" : "No"}
    </span>
  );
}

function StatusBadge({ status }: { status: "on" | "partial" | "off" }) {
  const label =
    status === "on"
      ? "Permitted"
      : status === "partial"
      ? "Permitted with restrictions"
      : "Not permitted";
  return <span className={`sr-badge sr-badge--${status}`}>{label}</span>;
}

function NotarizationLine({ rule }: { rule: StateRules["notarization"] }) {
  if (rule === "none") return <span>Not required</span>;
  if (rule === "minor-only")
    return (
      <span>
        May be required for minor contracts above a value threshold —{" "}
        <strong>verify with counsel before signing</strong>
      </span>
    );
  return (
    <span>
      <strong>Required</strong>
    </span>
  );
}

export function StateDetailPanel({ rules }: { rules: StateRules }) {
  if (!rules.documented) {
    return (
      <div className="sr-detail">
        <div className="sr-detail__head">
          <div>
            <span className="label">{rules.code} / NIL RULES</span>
            <h3>{rules.name}</h3>
          </div>
          <StatusBadge status={rules.hsNilAllowed} />
        </div>
        <div className="sr-stub">
          <strong>Documentation in progress.</strong>
          <p>
            We have the high-level eligibility flag for {rules.name} (
            <em>{rules.hsNilAllowed === "off" ? "HS NIL not permitted" : "HS NIL permitted"}</em>
            ), but we haven&apos;t yet published a verified rule readout for this
            state. Treat parental co-signature as required and confirm with your
            school&apos;s athletic director before signing any deal.
          </p>
          <p className="sr-stub__cta">
            On NILPro and in this state? Contact{" "}
            <a href="mailto:hello@thenilpro.com">hello@thenilpro.com</a> — we
            prioritize states with active athletes first.
          </p>
        </div>
        <div className="sr-detail__foot">
          <span>Last updated: {rules.lastUpdated}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-detail">
      <div className="sr-detail__head">
        <div>
          <span className="label">{rules.code} / NIL RULES</span>
          <h3>{rules.name}</h3>
        </div>
        <StatusBadge status={rules.hsNilAllowed} />
      </div>

      <dl className="sr-rules">
        <div className="sr-rules__row">
          <dt>HS NIL permitted</dt>
          <dd>
            <YesNo value={rules.hsNilAllowed !== "off"} />
            {rules.hsNilAllowed === "partial" && (
              <span className="sr-rules__qual"> with restrictions</span>
            )}
          </dd>
        </div>
        <div className="sr-rules__row">
          <dt>Parental consent to use NILPro</dt>
          <dd>
            <YesNo value={rules.parentalConsentRequired} />
          </dd>
        </div>
        <div className="sr-rules__row">
          <dt>Parent must co-sign deal contracts</dt>
          <dd>
            <YesNo value={rules.parentalCosignOnDeals} />
          </dd>
        </div>
        <div className="sr-rules__row">
          <dt>Notarization for minor contracts</dt>
          <dd>
            <NotarizationLine rule={rules.notarization} />
          </dd>
        </div>
        <div className="sr-rules__row">
          <dt>School pre-approval required</dt>
          <dd>
            <YesNo value={rules.schoolApprovalRequired} />
          </dd>
        </div>
        <div className="sr-rules__row">
          <dt>School disclosure required after signing</dt>
          <dd>
            <YesNo value={rules.schoolDisclosureRequired} />
          </dd>
        </div>
      </dl>

      <div className="sr-section">
        <h4>Banned deal categories</h4>
        <ul className="sr-banned">
          {rules.bannedCategories.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="sr-section">
        <h4>Notes</h4>
        <p>{rules.notes}</p>
      </div>

      <div className="sr-detail__foot">
        <span>
          Last updated: {rules.lastUpdated}
          {rules.sourceLabel && rules.sourceUrl && (
            <>
              {" · "}
              <a
                href={rules.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {rules.sourceLabel}
              </a>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
