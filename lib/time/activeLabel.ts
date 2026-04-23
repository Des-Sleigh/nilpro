/**
 * Turn a "since" timestamp into a human-readable "active" string that
 * advances one granularity at a time: days → weeks → months.
 *
 * Examples:
 *   0 days   → "1 day active"
 *   3 days   → "3 days active"
 *   7 days   → "1 week active"
 *   10 days  → "1 week active"   (not "1 week and 3 days")
 *   14 days  → "2 weeks active"
 *   28 days  → "1 month active"
 *   90 days  → "3 months active"
 */
export function activeLabel(since: string | Date | null | undefined): string {
  if (!since) return "1 day active";

  const then = typeof since === "string" ? new Date(since) : since;
  if (Number.isNaN(then.getTime())) return "1 day active";

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(0, Math.floor((Date.now() - then.getTime()) / msPerDay));

  if (days < 1) return "1 day active";
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} active`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? "week" : "weeks"} active`;

  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} active`;
}
