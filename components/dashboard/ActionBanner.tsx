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
  /** True when the athlete is a minor and their parent hasn't approved yet. */
  parentApprovalPending?: boolean;
  /** Parent's email — shown in the parent approval copy. */
  parentEmail?: string | null;
  /** Fallback 6-digit code for parents who can't / didn't get the email. */
  parentApprovalCode?: string | null;
  /** Server action to call when the athlete clicks "Resend email". */
  resendParentConsentAction?: (formData: FormData) => Promise<void>;
  /** True when the dashboard URL has ?email_resent=1. */
  parentEmailRecentlySent?: boolean;
  /** True when the athlete has an IG handle saved but it hasn't been
   *  verified yet. */
  verificationPending?: boolean;
  /** The athlete's IG handle (without @) — shown in the IG verification box. */
  igHandle?: string | null;
  /** The 6-digit verification code the athlete needs to DM to @nilpro. */
  verificationCode?: string | null;
  /** True when this is a HS athlete in a state that allows HS NIL with
   *  restrictions. */
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
  igHandle = null,
  verificationCode = null,
  hsStateRestricted = false,
  hsStateCode = null,
  hsStateNote = null,
}: Props) {
  // Priority:
  //   1. missingStep  (athlete is blocked on their own data — single banner,
  //                    everything else hides until they fix it)
  //   2. Otherwise: render every applicable alert stacked. Parent approval,
  //      IG verification, and state-restriction notices can all coexist.
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

  const banners: React.ReactNode[] = [];

  if (parentApprovalPending) {
    banners.push(
      <div key="parent" className="action-items">
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
    const igUrl = igHandle
      ? `https://instagram.com/${igHandle.replace(/^@+/, "")}`
      : null;
    const nilProIgUrl = "https://instagram.com/nilpro";
    banners.push(
      <div key="ig" className="action-items">
        <div className="action-items__left">
          <div className="action-items__icon">📸</div>
          <div className="action-items__text">
            Instagram verification needed
            <small>
              DM your code to{" "}
              <a
                href={nilProIgUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--green)", textDecoration: "underline" }}
              >
                @nilpro on Instagram
              </a>
              {igHandle ? (
                <>
                  {" "}
                  from your account{" "}
                  {igUrl ? (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--green)", textDecoration: "underline" }}
                    >
                      @{igHandle.replace(/^@+/, "")}
                    </a>
                  ) : (
                    <strong>@{igHandle.replace(/^@+/, "")}</strong>
                  )}
                </>
              ) : null}
              . We confirm you&apos;re a real athlete before pitches go out
              under your name (usually within 24 hours).
            </small>
            {verificationCode ? (
              <small
                style={{
                  display: "block",
                  marginTop: "0.35rem",
                  fontFamily: "var(--mono)",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                }}
              >
                Your code:{" "}
                <strong
                  style={{
                    color: "var(--text)",
                    letterSpacing: "0.16em",
                  }}
                >
                  {verificationCode}
                </strong>{" "}
                — DM exactly this to{" "}
                <a
                  href={nilProIgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--green)" }}
                >
                  @nilpro
                </a>
              </small>
            ) : null}
          </div>
        </div>
        <a
          href={nilProIgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="action-items__btn"
        >
          Open Instagram →
        </a>
      </div>
    );
  }

  if (hsStateRestricted && hsStateNote) {
    banners.push(
      <div key="state" className="action-items">
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

  if (banners.length > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {banners}
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
