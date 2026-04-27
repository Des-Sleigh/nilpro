/**
 * Email-safe approximation of the site's outlined neon-glow primary
 * button. Box-shadow renders in Gmail web/iOS + Apple Mail (subtle glow);
 * gracefully degrades to a clean outlined button in Outlook (no glow).
 *
 * Returns the full HTML for a CTA button you can drop into an inline
 * email layout. The button is wrapped in a centered <table> for max
 * compatibility — Outlook chokes on standalone styled <a>s sometimes.
 *
 * `variant: "ghost"` flips the colors to a quieter dark/grey treatment
 * (still outlined) for secondary CTAs. Defaults to "primary".
 */
export function emailButton(opts: {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
}): string {
  const variant = opts.variant ?? "primary";
  const isPrimary = variant === "primary";

  // Cheap HTML escaping for the label and href — callers pass user-ish
  // text sometimes (first names) so we don't trust it.
  const safeHref = escapeAttr(opts.href);
  const safeLabel = escapeText(opts.label);

  const borderColor = isPrimary ? "#00e676" : "#3a4358";
  const textColor = isPrimary ? "#00e676" : "#ffffff";
  const bgColor = "#0d1118";
  const glow = isPrimary
    ? "0 0 24px rgba(0, 230, 118, 0.4), 0 0 0 1px rgba(0, 230, 118, 0.5)"
    : "0 0 0 1px rgba(58, 67, 88, 0.6)";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td align="center" bgcolor="${bgColor}" style="background:${bgColor};border:2px solid ${borderColor};border-radius:10px;box-shadow:${glow};">
      <a href="${safeHref}" style="display:inline-block;padding:14px 28px;font-family:Impact,'Arial Black',sans-serif;font-size:15px;letter-spacing:0.06em;color:${textColor};text-transform:uppercase;text-decoration:none;font-weight:700;line-height:1;">
        ${safeLabel}
      </a>
    </td>
  </tr>
</table>`;
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
