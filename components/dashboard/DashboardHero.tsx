import Link from "next/link";

type Props = {
  firstName: string;
  lastName: string;
  level: string | null;
  sport: string | null;
  school: string | null;
  profilePhotoUrl?: string | null;
};

function initials(first: string, last: string) {
  const f = (first ?? "").trim().charAt(0).toUpperCase();
  const l = (last ?? "").trim().charAt(0).toUpperCase();
  return `${f}${l}` || "NP";
}

export function DashboardHero({
  firstName,
  lastName,
  level,
  sport,
  school,
  profilePhotoUrl,
}: Props) {
  const metaParts: string[] = [];
  if (level) metaParts.push(level);
  if (sport) metaParts.push(sport);
  if (school) metaParts.push(school);

  return (
    <header className="dash-hero">
      <div>
        <div className="dash-hero__welcome">Welcome back</div>
        <h1 className="dash-hero__name">
          {firstName}
          {lastName ? ` ${lastName}` : ""}
          <em>.</em>
        </h1>
        {metaParts.length > 0 ? (
          <div className="dash-hero__meta">
            {metaParts.map((p, i) => (
              <span key={`${p}-${i}`}>
                {i > 0 ? <span className="dot" style={{ marginRight: "0.6rem" }}>·</span> : null}
                <strong>{p}</strong>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="dash-hero__right">
        <Link
          href="/settings/profile"
          aria-label={
            profilePhotoUrl ? "Change your profile photo" : "Upload a profile photo"
          }
          className="dash-avatar-link"
          style={{
            position: "relative",
            display: "inline-block",
            cursor: "pointer",
          }}
        >
          {profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhotoUrl}
              alt={`${firstName}'s profile photo`}
              className="dash-avatar dash-avatar--photo"
            />
          ) : (
            <div className="dash-avatar" aria-hidden>
              {initials(firstName, lastName)}
            </div>
          )}
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-4px",
              right: "-4px",
              width: "32px",
              height: "32px",
              borderRadius: "9999px",
              background: "var(--bg)",
              border: "2px solid var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              boxShadow: "0 0 12px var(--green-glow)",
            }}
          >
            📷
          </span>
        </Link>
      </div>
    </header>
  );
}
