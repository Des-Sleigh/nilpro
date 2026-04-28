import Link from "next/link";
import { rulesFor } from "@/lib/states/stateRules";

export function StateRulesCard({
  hometownState,
}: {
  hometownState: string | null;
}) {
  const rules = rulesFor(hometownState);

  if (!rules) {
    return (
      <div className="snap-card">
        <div className="snap-card__label">
          <span>YOUR STATE&apos;S RULES</span>
        </div>
        <div className="snap-card__headline">
          Add your <em>home state</em>
        </div>
        <div className="snap-card__body">
          NIL rules — parental consent, co-signature, banned categories — vary
          by state. Update your profile to see what applies to you.
        </div>
        <div className="snap-card__foot">
          <Link href="/settings/profile" className="snap-card__cta">
            Add home state →
          </Link>
        </div>
      </div>
    );
  }

  const rightLabel =
    rules.hsNilAllowed === "on"
      ? "FULL ACCESS"
      : rules.hsNilAllowed === "partial"
      ? "RESTRICTIONS"
      : "NOT PERMITTED";
  const rightCls =
    rules.hsNilAllowed === "on"
      ? "snap-card__label-right snap-card__label-right--green"
      : rules.hsNilAllowed === "partial"
      ? "snap-card__label-right snap-card__label-right--gold"
      : "snap-card__label-right snap-card__label-right--red";

  const headline = rules.documented
    ? rules.hsNilAllowed === "on"
      ? "Full HS NIL access"
      : rules.hsNilAllowed === "partial"
      ? "Permitted with restrictions"
      : "HS NIL not yet permitted"
    : "Rules being documented";

  const body = rules.documented
    ? `Parent co-sign on deals: ${
        rules.parentalCosignOnDeals ? "yes" : "no"
      } · ${rules.bannedCategories.length} banned categories · ${
        rules.schoolDisclosureRequired
          ? "school disclosure required"
          : "no school disclosure"
      }.`
    : `We have your eligibility flag for ${rules.name} but the full rule readout is still being verified. Treat parent co-signature as required.`;

  return (
    <div className="snap-card">
      <div className="snap-card__label">
        <span>YOUR STATE&apos;S RULES — {rules.code}</span>
        <span className={rightCls}>{rightLabel}</span>
      </div>
      <div className="snap-card__headline">{headline}</div>
      <div className="snap-card__body">{body}</div>
      <div className="snap-card__foot">
        <Link
          href={`/state-rules?state=${rules.code}`}
          className="snap-card__cta"
        >
          See full {rules.name} rules →
        </Link>
      </div>
    </div>
  );
}
