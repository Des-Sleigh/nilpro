"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/parents", label: "Parents" },
  { href: "/coaches", label: "Coaches" },
  { href: "/businesses", label: "Businesses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/referrals", label: "Referrals" },
  { href: "/faq", label: "FAQ" },
];

export function Nav({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const close = () => setOpen(false);

  // Close the mobile menu when:
  // - the user clicks anywhere outside the nav element
  // - the user presses Escape
  // - the route changes (handled via pathname effect below)
  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: MouseEvent | TouchEvent) {
      if (!navRef.current) return;
      const target = e.target as Node | null;
      if (target && !navRef.current.contains(target)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the menu whenever the route changes (includes tapping the logo
  // or any internal Link).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="nav" ref={navRef}>
      <div className="nav__inner">
        <Link href="/" className="logo" onClick={close} aria-label="NILPro home">
          <Image
            src="/logo.svg"
            alt="NILPro"
            width={104}
            height={36}
            priority
            unoptimized
            style={{ height: "36px", width: "auto", display: "block" }}
          />
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
          {isSignedIn ? (
            <Link href="/dashboard" className="btn btn--primary btn--sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/signin" className="btn btn--ghost btn--sm">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn--primary btn--sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
