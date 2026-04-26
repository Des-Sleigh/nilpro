import Link from "next/link";

type Props = {
  firstName: string;
  lastName: string;
  level: string | null;
  sport: string | null;
  school: string | null;
  profilePhotoUrl?: string | null;
};

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ width: "60%", height: "60%" }}
    >
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.13-8 4.75V21h16v-2.25C20 16.13 16.42 14 12 14z" />
    </svg>
  );
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
      <div style={{ minWidth: 0, flex: 1 }}>
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
          title={profilePhotoUrl ? "Change photo" : "Upload a photo"}
        >
          {profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhotoUrl}
              alt={`${firstName}'s profile photo`}
              className="dash-avatar dash-avatar--photo"
            />
          ) : (
            <div className="dash-avatar dash-avatar--placeholder" aria-hidden>
              <PersonIcon />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
