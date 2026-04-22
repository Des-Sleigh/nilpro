"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/parents", label: "Parents" },
  { href: "/coaches", label: "Coaches" },
  { href: "/businesses", label: "Businesses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/referrals", label: "Referrals" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link href="/" className="logo" onClick={close}>
          <span className="logo__mark">N</span>
          <span className="logo__text">
            NIL<em>PRO</em>
          </span>
        </Link>

        <button
          className="nav__menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          MENU
        </button>

        <div className={`nav__links${open ? " nav__links--open" : ""}`}>
          {LINKS.map((l) => {
            const isActive = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className={`nav__link${isActive ? " active" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="nav__cta">
          <Link href="/signin" className="btn btn--ghost btn--sm">
            Sign in
          </Link>
          <Link href="/signup" className="btn btn--primary btn--sm">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
