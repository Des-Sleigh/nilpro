"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/pitches", label: "Pitches" },
  { href: "/admin/queue", label: "Queue" },
];

export function AdminSideNav() {
  const pathname = usePathname() ?? "";

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="admin-side">
      <div className="admin-side__brand">
        NIL<em>Pro</em>
        <span className="admin-pill">Admin</span>
      </div>

      <nav className="admin-side__nav">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              "admin-side__link" +
              (isActive(l.href) ? " admin-side__link--active" : "")
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="admin-side__foot">
        <Link href="/dashboard">← Athlete view</Link>
        <form action="/auth/signout" method="POST">
          <button type="submit">Sign out</button>
        </form>
      </div>
    </aside>
  );
}
