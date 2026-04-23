import Link from "next/link";

export function QuickActions() {
  const rows: {
    href: string;
    label: string;
    tag: string;
    tone: "green" | "gold" | "muted";
  }[] = [
    { href: "/settings/deal-menu", label: "Edit your deal menu", tag: "EDIT", tone: "green" },
    { href: "/settings/cities", label: "Update pitch cities", tag: "EDIT", tone: "green" },
    { href: "/target-list", label: "Review your target list", tag: "VIEW", tone: "muted" },
    { href: "/settings/profile", label: "Edit profile", tag: "EDIT", tone: "green" },
  ];

  return (
    <div className="dash-panel" style={{ marginTop: "0.75rem" }}>
      <div className="dash-panel__head">
        <div className="dash-panel__title">Quick actions</div>
      </div>
      <div className="dash-panel__body">
        {rows.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="qa-row"
          >
            <span
              className={
                "qa-row__tag" +
                (r.tone === "gold"
                  ? " qa-row__tag--gold"
                  : r.tone === "muted"
                  ? " qa-row__tag--muted"
                  : "")
              }
            >
              {r.tag}
            </span>
            <span className="qa-row__body">{r.label}</span>
            <span className="qa-row__arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
