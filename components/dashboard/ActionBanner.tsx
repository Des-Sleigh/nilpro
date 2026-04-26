import Link from "next/link";
import { ResendParentEmailButton } from "./ResendParentEmailButton";

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
  /** True when the athlete is a minor and their parent hasn't approved yet.
   *  Takes priority over verificationPending since it's a longer blocker. */
  parentApprovalPending?: boolean;
  /** Parent's email — shown in the parent approval copy. */
  parentEmail?: string | null;
  /** Fallback 6-digit code for parents who can't / didn't get the email.
   *  Optional — banner gracefully omits the line if missing. */
  parentApprovalCode?: string | null;
  /** Server action to call when the athlete clicks "Resend email".
   *  Optional — button is omitted if not provided. */
  resendParentConsentAction?: (formData: FormData) => Promise<void>;
  /** True when the dashboard URL has ?email_resent=1 — flips the resend
   *  button to a green "✓ Email sent" pill so the athlete sees it worked. */
  parentEmailRecentlySent?: boolean;
  /** True when the athlete has an IG handle saved but it hasn't been
   *  verified yet. Shown ahead of the quiet "sit tight" state so new
   *  accounts know outreach is gated on verification. */
  verificationPending?: boolean;
  /** True when this is a HS athlete in a state that allows HS NIL with
   *  restrictions. Shows alongside the other state — informational. */
  hsStateRestricted?: boolean;
  /** State code (e.g. "TX") + the body of the restriction notice. */
  hsStateCode?: string | null;
  hsStateNote?: string | null;
};

export function ActionBanner({
  quiet = true,
  missingStep,
  parentApprovalPending = false,
  parentEmail = null,
  parentApprovalCode = null,
  resendParentConsentAction,
  parentEmailRecentlySent = false,
  verificationPending = false,
  hsStateRestricted = false,
  hsStateCode = null,
  hsStateNote = null,
}: Props) {
  // Priority order:
  //   1. missingStep  (athlete is blocked on their own data)
  //   2. parentApprovalPending  (longest blocker: out-of-band approval)
  //   3. verificationPending    (admin-side IG verification)
  //   4. quiet ✓
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

  if (parentApprovalPending) {
    return (
      <div className="action-items">
        <div className="action-items__left">
          <div className="action-items__icon">⏳</div>
          <div className="action-items__text">
            Parent approval needed
            <small>
              {parentEmail ? (
                <>
                  Email sent to{" "}
                  <strong style={{ color: "var(--text)" }}>{parentEmail}</strong>
                  . They&apos;ll click the link to approve. Pitches don&apos;t
                  start until then.
                </>
              ) : (
                <>
                  Your parent will get an email. Pitches don&apos;t start until
                  they approve.
                </>
              )}
            </small>
            {parentApprovalCode ? (
              <small
                style={{
                  display: "block",
                  marginTop: "0.35rem",
                  fontFamily: "var(--mono)",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                }}
              >
                If they didn&apos;t get it: send code{" "}
                <strong
                  style={{
                    color: "var(--text)",
                    letterSpacing: "0.16em",
                  }}
                >
                  {parentApprovalCode}
                </strong>{" "}
                — they can enter it at thenilpro.com/parent
              </small>
            ) : null}
          </div>
        </div>
        {resendParentConsentAction && parentEmail ? (
          <ResendParentEmailButton
            resendAction={resendParentConsentAction}
            recentlySent={parentEmailRecentlySent}
          />
        ) : null}
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

  if (hsStateRestricted && hsStateNote) {
    return (
      <div className="action-items">
        <div className="action-items__left">
          <div className="action-items__icon">⚑</div>
          <div className="action-items__text">
            Restrictions in {hsStateCode ?? "your state"}
            <small>{hsStateNote}</small>
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
