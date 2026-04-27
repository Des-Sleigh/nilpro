import { getResend, getFromEmail } from "./resend";
import { emailButton } from "./emailButton";

export type ParentConsentParams = {
  athleteFirstName: string;
  athleteLastName: string;
  parentFirstName: string;
  parentEmail: string;
  /** Full URL with `?token=…` — clicking it lands the parent on
   *  /parent/approve where we render the approval card. */
  approveUrl: string;
  /** 6-digit fallback code for parents who can't follow the link. */
  fallbackCode: string;
};

export type ParentConsentResult =
  | { skipped: true; reason: string }
  | { skipped: false; id: string | null }
  | { skipped: false; error: string };

/** Returns true when the result represents a successful send. */
export function consentResultSent(r: ParentConsentResult): boolean {
  return r.skipped === false && !("error" in r);
}

/** Cheap HTML-escape for values we drop into the email body. We control
 *  every input, but a parent's first name is user-provided — be safe. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(p: ParentConsentParams): string {
  const af = esc(p.athleteFirstName);
  const al = esc(p.athleteLastName);
  const pf = esc(p.parentFirstName);
  const code = esc(p.fallbackCode);

  // Inline-CSS only. ~600px wide. Dark bg, white text, green CTA.
  // No images, no external CSS, no web fonts — maximum inbox compatibility.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>${af} needs your OK to use NILPro</title>
</head>
<body style="margin:0;padding:0;background:#07090f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${af} just signed up for NILPro and needs your approval to start. Takes 30 seconds.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0d1118;border:1px solid #242c3d;border-radius:14px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <a href="https://thenilpro.com" style="display:inline-block;text-decoration:none;line-height:0;">
                <img
                  src="https://thenilpro.com/wordmark.png"
                  alt="NILPro"
                  width="160"
                  height="54"
                  style="display:block;width:160px;height:auto;border:0;outline:none;"
                />
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 8px 32px;color:#ffffff;font-size:16px;line-height:1.55;">
              <p style="margin:18px 0 14px 0;color:#ffffff;font-size:16px;">Hi ${pf},</p>
              <p style="margin:0 0 14px 0;color:#aeb8cc;font-size:16px;">
                <strong style="color:#ffffff;">${af} ${al}</strong> just signed up for NILPro &mdash; software that helps student-athletes land NIL deals with local businesses (free meals, gear, cash for posts, that kind of thing).
              </p>
              <p style="margin:0 0 22px 0;color:#aeb8cc;font-size:16px;">
                Since ${af} is under 18, they can&rsquo;t run this without your approval. Click below to review and give consent &mdash; takes about 30 seconds.
              </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td align="center" style="padding:6px 32px 26px 32px;">
              ${emailButton({
                href: p.approveUrl,
                label: `✓ Approve ${p.athleteFirstName}'s NILPro account`,
              })}
            </td>
          </tr>

          <!-- What you're saying yes to -->
          <tr>
            <td style="padding:6px 32px 8px 32px;">
              <div style="border-top:1px solid #242c3d;padding-top:22px;">
                <div style="font-family:'Arial Black',sans-serif;font-size:11px;letter-spacing:0.16em;color:#00e676;text-transform:uppercase;margin-bottom:10px;">
                  What you&rsquo;re saying yes to
                </div>
                <ul style="margin:0 0 14px 0;padding:0 0 0 20px;color:#aeb8cc;font-size:15px;line-height:1.55;">
                  <li style="margin-bottom:8px;">NILPro can pitch local businesses on ${af}&rsquo;s behalf.</li>
                  <li style="margin-bottom:8px;">${af} approves every business before any pitch goes out.</li>
                  <li style="margin-bottom:8px;">You&rsquo;ll review every actual deal before it&rsquo;s signed.</li>
                  <li style="margin-bottom:8px;">NILPro is software, not an agent &mdash; we never represent ${af} and we never touch any money.</li>
                  <li style="margin-bottom:0;">Deals are direct between ${af} and the business.</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Fallback code -->
          <tr>
            <td style="padding:14px 32px 8px 32px;">
              <div style="background:#141923;border:1px solid #242c3d;border-radius:10px;padding:16px 18px;">
                <div style="font-size:13px;color:#6a7690;margin-bottom:6px;">Can&rsquo;t click the button?</div>
                <div style="font-size:14px;color:#aeb8cc;line-height:1.5;">
                  Visit <a href="https://thenilpro.com/parent" style="color:#00e676;text-decoration:none;">thenilpro.com/parent</a> and enter this code:
                </div>
                <div style="margin-top:10px;font-family:'Courier New',monospace;font-size:24px;font-weight:700;letter-spacing:0.18em;color:#ffffff;">
                  ${code}
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer copy -->
          <tr>
            <td style="padding:18px 32px 28px 32px;">
              <p style="margin:0 0 10px 0;color:#aeb8cc;font-size:14px;">
                Questions or concerns? Just reply &mdash; goes straight to the founder.
              </p>
              <p style="margin:0;color:#6a7690;font-size:13px;">
                &mdash; NILPro &middot; <a href="https://thenilpro.com" style="color:#6a7690;text-decoration:underline;">thenilpro.com</a>
              </p>
            </td>
          </tr>
        </table>

        <div style="max-width:600px;margin:14px auto 0 auto;color:#4a546a;font-size:12px;text-align:center;line-height:1.5;">
          This email was sent because ${af} listed you as their parent on NILPro. If you weren&rsquo;t expecting this, just ignore it &mdash; nothing happens until you click approve.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(p: ParentConsentParams): string {
  return [
    `Hi ${p.parentFirstName},`,
    ``,
    `${p.athleteFirstName} ${p.athleteLastName} just signed up for NILPro — software that helps student-athletes land NIL deals with local businesses (free meals, gear, cash for posts, that kind of thing).`,
    ``,
    `Since ${p.athleteFirstName} is under 18, they can't run this without your approval. Open this link to review and give consent:`,
    ``,
    p.approveUrl,
    ``,
    `What you're saying yes to:`,
    `  • NILPro can pitch local businesses on ${p.athleteFirstName}'s behalf.`,
    `  • ${p.athleteFirstName} approves every business before any pitch goes out.`,
    `  • You'll review every actual deal before it's signed.`,
    `  • NILPro is software, not an agent — we never represent ${p.athleteFirstName} and we never touch any money.`,
    `  • Deals are direct between ${p.athleteFirstName} and the business.`,
    ``,
    `Can't click the link? Visit https://thenilpro.com/parent and enter this code: ${p.fallbackCode}`,
    ``,
    `Questions or concerns? Just reply — goes straight to the founder.`,
    ``,
    `— NILPro`,
    `https://thenilpro.com`,
  ].join("\n");
}

/** Sends the parent-consent email. Never throws — returns a result object
 *  indicating skipped (no API key), sent (with id), or error (with message).
 *  The athlete's signup must succeed even if this fails. */
export async function sendParentConsentEmail(
  p: ParentConsentParams
): Promise<ParentConsentResult> {
  const resend = getResend();
  if (!resend) {
    return { skipped: true, reason: "RESEND_API_KEY not set" };
  }

  const subject = `${p.athleteFirstName} needs your OK to use NILPro`;
  const html = buildHtml(p);
  const text = buildText(p);

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [p.parentEmail],
      subject,
      html,
      text,
    });

    if (error) {
      const msg = typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : JSON.stringify(error);
      console.error(`[parent-consent] Resend returned error: ${msg}`);
      return { skipped: false, error: msg };
    }

    return { skipped: false, id: data?.id ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[parent-consent] send threw: ${msg}`);
    return { skipped: false, error: msg };
  }
}
