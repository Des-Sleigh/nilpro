import Link from "next/link";

type Props = {
  handle: string | null;
  platform: string | null;
  verified: boolean;
  pitchCities: { city: string; state: string }[];
};

export function SocialLinkSummary({
  handle,
  platform,
  verified,
  pitchCities,
}: Props) {
  const hasSocial = Boolean(handle);
  const platformLabel =
    platform === "instagram" ? "Instagram" : platform === "tiktok" ? "TikTok" : "";

  return (
    <div className="snap-card">
      <div className="snap-card__label">
        <span>PROFILE &amp; REACH</span>
        <span
          className={
            "snap-card__label-right " +
            (hasSocial && verified
              ? "snap-card__label-right--green"
              : "snap-card__label-right--gold")
          }
        >
          {!hasSocial
            ? "UNLINKED"
            : verified
            ? "VERIFIED"
            : "PENDING"}
        </span>
      </div>

      {hasSocial ? (
        <div className="snap-card__headline">
          @<em>{handle}</em>
          {platformLabel ? (
            <span
              style={{
                marginLeft: "0.4rem",
                color: "var(--text-muted)",
                fontSize: "0.75em",
                fontFamily: "var(--mono)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {platformLabel}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="snap-card__headline">No social linked</div>
      )}

      <div className="snap-card__body">
        {pitchCities.length > 0 ? (
          <>
            Pitching in{" "}
            {pitchCities.map((c, i) => (
              <span key={i}>
                <strong>
                  {c.city}, {c.state}
                </strong>
                {i < pitchCities.length - 1 ? " · " : ""}
              </span>
            ))}
            .
          </>
        ) : (
          <>No pitch cities set yet — add at least one to start outreach.</>
        )}
      </div>

      <div className="snap-card__foot">
        {hasSocial ? (
          <Link
            href="/settings/profile"
            className="snap-card__cta snap-card__cta--muted"
          >
            View profile →
          </Link>
        ) : (
          <Link href="/signup/verify" className="snap-card__cta">
            Link your account →
          </Link>
        )}
      </div>
    </div>
  );
}
