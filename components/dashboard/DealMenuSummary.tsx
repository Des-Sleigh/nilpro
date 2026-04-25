import Link from "next/link";

type Props = {
  cashEnabled: boolean;
  cashMin: number | null;
  gearEnabled: boolean;
  productEnabled: boolean;
  appearanceEnabled: boolean;
  appearanceMin: number | null;
};

function fmtMoney(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "";
  return `$${Math.round(n).toLocaleString()}`;
}

export function DealMenuSummary({
  cashEnabled,
  cashMin,
  gearEnabled,
  productEnabled,
  appearanceEnabled,
  appearanceMin,
}: Props) {
  const accepted: string[] = [];
  if (cashEnabled) {
    accepted.push(cashMin ? `Cash (${fmtMoney(cashMin)}+ / post)` : "Cash per post");
  }
  if (gearEnabled) accepted.push("Gear");
  if (productEnabled) accepted.push("Services & meals");
  if (appearanceEnabled) {
    accepted.push(
      appearanceMin ? `Appearances (${fmtMoney(appearanceMin)}+)` : "Appearances"
    );
  }

  const noneSet = accepted.length === 0;

  return (
    <div className="snap-card">
      <div className="snap-card__label">
        <span>DEAL MENU</span>
        <span
          className={
            "snap-card__label-right " +
            (noneSet
              ? "snap-card__label-right--gold"
              : "snap-card__label-right--green")
          }
        >
          {noneSet ? "NEEDS SETUP" : "LIVE"}
        </span>
      </div>

      {noneSet ? (
        <>
          <div className="snap-card__headline">No deal types set</div>
          <div className="snap-card__body">
            Tell us what you&apos;ll accept — cash, gear, services, appearances —
            and set your minimums. Businesses see these in every pitch.
          </div>
        </>
      ) : (
        <>
          <div className="snap-card__headline">
            You accept <em>{accepted.length}</em>{" "}
            deal {accepted.length === 1 ? "type" : "types"}
          </div>
          <div className="snap-card__body">
            {accepted.map((a, i) => (
              <div key={i}>
                <strong>·</strong> {a}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="snap-card__foot">
        <Link href="/settings/deal-menu" className="snap-card__cta">
          Edit menu →
        </Link>
      </div>
    </div>
  );
}
