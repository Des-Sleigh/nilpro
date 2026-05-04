import Image from "next/image";
import Link from "next/link";

const PRODUCT = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/referrals", label: "Referrals" },
  { href: "/faq", label: "FAQ" },
];

const AUDIENCE = [
  { href: "/", label: "Athletes" },
  { href: "/parents", label: "Parents" },
  { href: "/coaches", label: "Coaches" },
  { href: "/businesses", label: "Businesses" },
];

const RESOURCES = [
  { href: "/state-rules", label: "State NIL rules" },
  { href: "/waitlist", label: "Join the waitlist" },
  { href: "/resources/parent-guide", label: "Parent guide" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/acceptable-use", label: "Acceptable use" },
  { href: "/legal/not-agents", label: "We are not agents" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container-page">
        <div className="footer__top">
          <div className="footer__brand">
            <Link href="/" aria-label="NILPro home" style={{ display: "inline-block", marginBottom: "1rem" }}>
              <Image
                src="/logo.svg"
                alt="NILPro"
                width={154}
                height={56}
                unoptimized
                style={{ height: "56px", width: "auto", display: "block" }}
              />
            </Link>
            <div className="footer__tagline">
              Local NIL deals for every high school and college athlete. Every sport. Every level.
              Free to sign up. Zero commission.
            </div>
          </div>

          <div>
            <div className="footer__col-head">PRODUCT</div>
            <ul className="footer__links">
              {PRODUCT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer__col-head">WHO IT&apos;S FOR</div>
            <ul className="footer__links">
              {AUDIENCE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer__col-head">RESOURCES</div>
            <ul className="footer__links">
              {RESOURCES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer__col-head">LEGAL</div>
            <ul className="footer__links">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__legal">
            © {year} NILPRO &nbsp;·&nbsp; <strong>EST. 2026</strong>
          </div>
          <div className="footer__legal">HELLO@NILPRO.COM</div>
        </div>

        <div className="footer__disclaimer">
          NILPro is a software tool for athlete outreach. We are not an agent and do not negotiate
          deals on behalf of athletes. All endorsement agreements are made directly between
          athletes and businesses. NILPro does not handle payments between parties. Athletes are
          responsible for compliance with NCAA, state, and school-specific NIL rules. Not
          affiliated with the NCAA, any athletic conference, or any professional sports league.
        </div>
      </div>
    </footer>
  );
}
