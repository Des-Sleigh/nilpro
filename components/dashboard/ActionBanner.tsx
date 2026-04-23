import Link from "next/link";

type Props = {
  /** When true, render the quiet "everything's set up, sit tight" variant. */
  quiet?: boolean;
  /** Optional override — if the new account is missing a step we point them at it. */
  missingStep?: {
    label: string;
    sub: string;
    href: string;
    cta: string;
  };
  /** True when the athlete has an IG handle saved but it hasn't been
   *  verified yet. Shown ahead of the quiet "sit tight" state so new
   *  accounts know outreach is gated on verification. */
  verificationPending?: boolean;
};

export function ActionBanner({
  quiet = true,
  missingStep,
  verificationPending = false,
}: Props) {
  if (missingStep) {
    return (
      <div className="action-items">
        <div className="action-items__left">
          <div className="action-items__icon">!</div>
          <div className="action-items__text">
            {missingStep.label}
            <small>{missingStep.sub}</small>
          </div>
        </div>
        <Link href={missingStep.href} className="action-items__btn">
          {missingStep.cta} →
        </Link>
      </div>
    );
  }

  if (verificationPending) {
    return (
      <div className="action-items">
        <div className="action-items__left">
          <div className="action-items__icon">⏳</div>
          <div className="action-items__text">
            Verification pending
            <small>
              We&apos;re confirming your Instagram. Outreach starts the moment
              you&apos;re verified (usually within 24 hours).
            </small>
          </div>
        </div>
      </div>
    );
  }

  if (quiet) {
    return (
      <div className="action-items action-items--quiet">
        <div className="action-items__left">
          <div className="action-items__icon">✓</div>
          <div className="action-items__text">
            You&apos;re set up — we&apos;re queueing your first round
            <small>
              Nothing needs your attention right now. We&apos;ll email you the
              moment a business replies.
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-items">
      <div className="action-items__left">
        <div className="action-items__icon">!</div>
        <div className="action-items__text">
          Something needs your attention
          <small>Check your responses tab</small>
        </div>
      </div>
    </div>
  );
}
