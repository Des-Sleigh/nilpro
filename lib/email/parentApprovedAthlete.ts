import { getResend, getFromEmail } from "./resend";
import { emailButton } from "./emailButton";

export type ParentApprovedAthleteParams = {
  athleteFirstName: string;
  athleteEmail: string;
  parentFirstName: string;
  dashboardUrl?: string;
};

export type ParentApprovedAthleteResult =
  | { skipped: true; reason: string }
  | { skipped: false; id: string | null }
  | { skipped: false; error: string };

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(
  p: ParentApprovedAthleteParams,
  dashboardUrl: string
): string {
  const af = esc(p.athleteFirstName);
  const pf = esc(p.parentFirstName);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>${pf} approved — you&rsquo;re cleared to go</title>
</head>
<body style="margin:0;padding:0;background:#07090f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${pf} just approved your NILPro account. Next stop: Instagram verification.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0d1118;border:1px solid #242c3d;border-radius:14px;overflow:hidden;">
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
          <tr>
            <td style="padding:8px 32px 8px 32px;color:#ffffff;font-size:16px;line-height:1.55;">
              <p style="margin:18px 0 14px 0;color:#ffffff;font-size:18px;font-weight:700;">You&rsquo;re cleared to go, ${af}.</p>
              <p style="margin:0 0 22px 0;color:#aeb8cc;font-size:16px;">
                Your parent ${pf} just approved your NILPro account. We&rsquo;re moving forward with outreach as soon as your Instagram is verified. You&rsquo;ll see pitches and replies in your dashboard.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 32px 26px 32px;">
              ${emailButton({
                href: dashboardUrl,
                label: "Open my dashboard",
              })}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;">
              <p style="margin:0 0 10px 0;color:#aeb8cc;font-size:14px;">
                Questions? Just reply &mdash; goes straight to the founder.
              </p>
              <p style="margin:0;color:#6a7690;font-size:13px;">
                &mdash; NILPro &middot; <a href="https://thenilpro.com" style="color:#6a7690;text-decoration:underline;">thenilpro.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(
  p: ParentApprovedAthleteParams,
  dashboardUrl: string
): string {
  return [
    `You're cleared to go, ${p.athleteFirstName}.`,
    ``,
    `Your parent ${p.parentFirstName} just approved your NILPro account. We're moving forward with outreach as soon as your Instagram is verified. You'll see pitches and replies in your dashboard.`,
    ``,
    `Open your dashboard: ${dashboardUrl}`,
    ``,
    `Questions? Just reply — goes straight to the founder.`,
    ``,
    `— NILPro`,
    `https://thenilpro.com`,
  ].join("\n");
}

/** Sent to the athlete when their parent flips parent_approved_at. Never
 *  throws — caller must not block on the result. */
export async function sendParentApprovedAthleteEmail(
  p: ParentApprovedAthleteParams
): Promise<ParentApprovedAthleteResult> {
  const resend = getResend();
  if (!resend) {
    return { skipped: true, reason: "RESEND_API_KEY not set" };
  }

  const dashboardUrl = p.dashboardUrl ?? "https://thenilpro.com/dashboard";
  const subject = `${p.parentFirstName} approved — you're cleared to go`;
  const html = buildHtml(p, dashboardUrl);
  const text = buildText(p, dashboardUrl);

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [p.athleteEmail],
      subject,
      html,
      text,
    });

    if (error) {
      const msg =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : JSON.stringify(error);
      console.error(`[parent-approved-athlete] Resend returned error: ${msg}`);
      return { skipped: false, error: msg };
    }
    return { skipped: false, id: data?.id ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[parent-approved-athlete] send threw: ${msg}`);
    return { skipped: false, error: msg };
  }
}
