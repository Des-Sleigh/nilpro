import Link from "next/link";

type Props = {
  approvedCount: number;
  pendingCount: number;
  locationCount: number;
  categoryCount: number;
};

/**
 * "Target list" snapshot tile. Blacklisted and removed statuses are
 * intentionally not surfaced here — that's an admin/back-office concern.
 */
export function TargetListSummary({
  approvedCount,
  pendingCount,
  locationCount,
  categoryCount,
}: Props) {
  const hasList = approvedCount > 0 || pendingCount > 0;

  return (
    <div className="snap-card">
      <div className="snap-card__label">
        <span>TARGET LIST</span>
        {hasList ? (
          <span className="snap-card__label-right snap-card__label-right--green">
            ACTIVE
          </span>
        ) : null}
      </div>

      {hasList ? (
        <>
          <div className="snap-card__headline">
            <em>{approvedCount}</em>{" "}
            {approvedCount === 1 ? "business" : "businesses"} approved
          </div>
          <div className="snap-card__body">
            {pendingCount > 0 ? (
              <>
                <strong>{pendingCount}</strong> still awaiting your review
                {locationCount > 0 ? " · " : ""}
              </>
            ) : null}
            {locationCount > 0
              ? `across ${locationCount} ${
                  locationCount === 1 ? "location" : "locations"
                }`
              : null}
            {categoryCount > 0 ? ` and ${categoryCount} ${
              categoryCount === 1 ? "category" : "categories"
            }` : null}
            .
          </div>
        </>
      ) : (
        <>
          <div className="snap-card__headline">No list yet</div>
          <div className="snap-card__body">
            Pick cities and categories — we&apos;ll pull a personalized target
            list of nearby businesses.
          </div>
        </>
      )}

      <div className="snap-card__foot">
        <Link
          href={hasList ? "/target-list" : "/signup/targets"}
          className="snap-card__cta"
        >
          {hasList ? "See your full list" : "Build your list"} →
        </Link>
      </div>
    </div>
  );
}
