/**
 * Static HTML strings for the three Supabase Auth email templates.
 *
 * Supabase only lets you paste templates via the dashboard UI, so these
 * live here as raw HTML constants. Copy each constant's value into the
 * matching template box at:
 *   Supabase project → Authentication → Email Templates
 *
 *   - SUPABASE_TEMPLATE_CONFIRM_SIGNUP   → "Confirm signup"
 *   - SUPABASE_TEMPLATE_RESET_PASSWORD   → "Reset Password"
 *   - SUPABASE_TEMPLATE_MAGIC_LINK       → "Magic Link"
 *
 * Visual treatment matches the in-app outlined neon-glow primary button
 * (see lib/email/emailButton.ts). Box-shadow renders in Gmail web/iOS +
 * Apple Mail; degrades to a clean outlined button in Outlook.
 *
 * The href format keeps Supabase's expected shape:
 *   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=…&next=…
 */

export const SUPABASE_TEMPLATE_CONFIRM_SIGNUP = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>Confirm your NILPro account</title>
</head>
<body style="margin:0;padding:0;background:#07090f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0d1118;border:1px solid #242c3d;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <a href="https://thenilpro.com" style="display:inline-block;text-decoration:none;line-height:0;">
                <img src="https://thenilpro.com/wordmark.png" alt="NILPro" width="160" height="54" style="display:block;width:160px;height:auto;border:0;outline:none;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px 32px;color:#ffffff;font-size:16px;line-height:1.55;">
              <p style="margin:18px 0 14px 0;color:#ffffff;font-size:18px;font-weight:700;">Confirm your account</p>
              <p style="margin:0 0 22px 0;color:#aeb8cc;font-size:16px;">
                Click the button below to confirm your email and finish setting up your NILPro account.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 32px 26px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="#141923" style="background:#141923;border:2px solid #00e676;border-radius:14px;box-shadow:0 0 0 1px rgba(0, 230, 118, 0.6), 0 0 28px rgba(0, 230, 118, 0.45), 0 0 80px rgba(0, 230, 118, 0.18), inset 0 0 28px rgba(0, 230, 118, 0.06);mso-padding-alt:0;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/signup/profile" style="display:inline-block;padding:18px 32px;font-family:'Arial Narrow Bold',Impact,'Arial Black',Arial,sans-serif;font-size:16px;letter-spacing:0.12em;color:#00e676;text-transform:uppercase;text-decoration:none;font-weight:800;line-height:1;">
                      Confirm my account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;">
              <p style="margin:0 0 10px 0;color:#aeb8cc;font-size:14px;">
                If you didn&rsquo;t sign up for NILPro, you can ignore this email.
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

export const SUPABASE_TEMPLATE_RESET_PASSWORD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>Reset your NILPro password</title>
</head>
<body style="margin:0;padding:0;background:#07090f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0d1118;border:1px solid #242c3d;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <a href="https://thenilpro.com" style="display:inline-block;text-decoration:none;line-height:0;">
                <img src="https://thenilpro.com/wordmark.png" alt="NILPro" width="160" height="54" style="display:block;width:160px;height:auto;border:0;outline:none;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px 32px;color:#ffffff;font-size:16px;line-height:1.55;">
              <p style="margin:18px 0 14px 0;color:#ffffff;font-size:18px;font-weight:700;">Reset your password</p>
              <p style="margin:0 0 22px 0;color:#aeb8cc;font-size:16px;">
                Click the button below to set a new password for your NILPro account. The link expires shortly &mdash; if it&rsquo;s stale, request another from the sign-in page.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 32px 26px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="#141923" style="background:#141923;border:2px solid #00e676;border-radius:14px;box-shadow:0 0 0 1px rgba(0, 230, 118, 0.6), 0 0 28px rgba(0, 230, 118, 0.45), 0 0 80px rgba(0, 230, 118, 0.18), inset 0 0 28px rgba(0, 230, 118, 0.06);mso-padding-alt:0;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password" style="display:inline-block;padding:18px 32px;font-family:'Arial Narrow Bold',Impact,'Arial Black',Arial,sans-serif;font-size:16px;letter-spacing:0.12em;color:#00e676;text-transform:uppercase;text-decoration:none;font-weight:800;line-height:1;">
                      Reset my password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;">
              <p style="margin:0 0 10px 0;color:#aeb8cc;font-size:14px;">
                Didn&rsquo;t request a reset? Safe to ignore &mdash; your password won&rsquo;t change.
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

export const SUPABASE_TEMPLATE_MAGIC_LINK = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>Your NILPro sign-in link</title>
</head>
<body style="margin:0;padding:0;background:#07090f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0d1118;border:1px solid #242c3d;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <a href="https://thenilpro.com" style="display:inline-block;text-decoration:none;line-height:0;">
                <img src="https://thenilpro.com/wordmark.png" alt="NILPro" width="160" height="54" style="display:block;width:160px;height:auto;border:0;outline:none;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px 32px;color:#ffffff;font-size:16px;line-height:1.55;">
              <p style="margin:18px 0 14px 0;color:#ffffff;font-size:18px;font-weight:700;">Your sign-in link</p>
              <p style="margin:0 0 22px 0;color:#aeb8cc;font-size:16px;">
                Click below to sign in to NILPro. The link is single-use and expires shortly.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 32px 26px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="#141923" style="background:#141923;border:2px solid #00e676;border-radius:14px;box-shadow:0 0 0 1px rgba(0, 230, 118, 0.6), 0 0 28px rgba(0, 230, 118, 0.45), 0 0 80px rgba(0, 230, 118, 0.18), inset 0 0 28px rgba(0, 230, 118, 0.06);mso-padding-alt:0;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard" style="display:inline-block;padding:18px 32px;font-family:'Arial Narrow Bold',Impact,'Arial Black',Arial,sans-serif;font-size:16px;letter-spacing:0.12em;color:#00e676;text-transform:uppercase;text-decoration:none;font-weight:800;line-height:1;">
                      Sign in to NILPro
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;">
              <p style="margin:0 0 10px 0;color:#aeb8cc;font-size:14px;">
                Didn&rsquo;t request this link? Ignore the email &mdash; nothing happens unless you click.
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
