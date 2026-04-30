/**
 * Email-safe approximation of the site's outlined neon-glow primary
 * button (.btn--primary in app/globals.css). Multi-layer box-shadow
 * renders in Apple Mail / iOS Mail / Gmail web / Android Gmail
 * (full neon halo); gracefully degrades to a clean outlined button
 * in Outlook desktop (no glow, but otherwise readable).
 *
 * Returns the full HTML for a CTA button you can drop into an inline
 * email layout. The button is wrapped in a centered <table> for max
 * compatibility — Outlook chokes on standalone styled <a>s.
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

  // Cheap HTML escaping — callers pass user-ish text sometimes (first
  // names, athlete-supplied) so we don't trust it.
  const safeHref = escapeAttr(opts.href);
  const safeLabel = escapeText(opts.label);

  // Color palette matches app/globals.css tokens:
  //   --green:    #00e676
  //   --bg-elev:  #141923
  //   --border-strong: #2e3852
  //   --text:     #ffffff
  const borderColor = isPrimary ? "#00e676" : "#2e3852";
  const textColor = isPrimary ? "#00e676" : "#ffffff";
  const bgColor = "#141923";

  // Multi-layer glow matches the site's .btn--primary box-shadow stack.
  // Older clients (Outlook desktop) ignore box-shadow entirely; that's
  // fine — they render a clean outlined button.
  const glow = isPrimary
    ? "0 0 0 1px rgba(0, 230, 118, 0.6), 0 0 28px rgba(0, 230, 118, 0.45), 0 0 80px rgba(0, 230, 118, 0.18), inset 0 0 28px rgba(0, 230, 118, 0.06)"
    : "inset 0 0 24px rgba(0, 0, 0, 0.4)";

  // Font stack: site uses Barlow Condensed (--cond) which isn't web-safe
  // in email. "Arial Narrow Bold" + Impact + Arial Black approximates the
  // condensed-bold sans feel and is safe across Apple Mail / Gmail / Outlook.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td align="center" bgcolor="${bgColor}" style="background:${bgColor};border:2px solid ${borderColor};border-radius:14px;box-shadow:${glow};mso-padding-alt:0;">
      <a href="${safeHref}" style="display:inline-block;padding:18px 32px;font-family:'Arial Narrow Bold',Impact,'Arial Black',Arial,sans-serif;font-size:16px;letter-spacing:0.12em;color:${textColor};text-transform:uppercase;text-decoration:none;font-weight:800;line-height:1;">
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

/** Escape a string for use inside a double-quoted HTML attribute.
 *  Order matters: replace & first, then ", to avoid double-encoding
 *  the & in &quot;. (Previous version had a bug where & was escaped
 *  AFTER " was, which produced &amp;quot; in user-supplied URLs.) */
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
