type Props = {
  dealsClosed: number;
  pendingReplies: number;
  pitchesSent: number;
  approvedCount: number;
};

/**
 * Hero stats row. Mirrors the v6 design: four big numbers, display-font,
 * colored accents for motion. For new accounts everything but "approved"
 * will be 0 — we prefer a friendly sub-label over a flat "0".
 */
export function StatsRow({
  dealsClosed,
  pendingReplies,
  pitchesSent,
  approvedCount,
}: Props) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card__label">DEALS CLOSED</div>
        <div
          className={
            "stat-card__num " +
            (dealsClosed > 0 ? "stat-card__num--green" : "stat-card__num--muted")
          }
        >
          {dealsClosed}
        </div>
        <div
          className={
            "stat-card__sub" + (dealsClosed === 0 ? " stat-card__sub--empty" : "")
          }
        >
          {dealsClosed === 0 ? "First deal ships with your first yes" : "Across all partners"}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">PENDING REPLIES</div>
        <div
          className={
            "stat-card__num " +
            (pendingReplies > 0 ? "stat-card__num--gold" : "stat-card__num--muted")
          }
        >
          {pendingReplies}
        </div>
        <div
          className={
            "stat-card__sub" +
            (pendingReplies === 0 ? " stat-card__sub--empty" : "")
          }
        >
          {pendingReplies === 0 ? "Inbox is quiet — for now" : "Waiting on your move"}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">PITCHES SENT</div>
        <div
          className={
            "stat-card__num " +
            (pitchesSent > 0 ? "" : "stat-card__num--muted")
          }
        >
          {pitchesSent}
        </div>
        <div
          className={
            "stat-card__sub" + (pitchesSent === 0 ? " stat-card__sub--empty" : "")
          }
        >
          {pitchesSent === 0 ? "First round queued within 24h" : "Outreach in motion"}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">ON YOUR LIST</div>
        <div
          className={
            "stat-card__num " +
            (approvedCount > 0 ? "stat-card__num--green" : "stat-card__num--muted")
          }
        >
          {approvedCount}
        </div>
        <div className="stat-card__sub">
          {approvedCount === 0
            ? "Add cities + categories to build it"
            : `${approvedCount === 1 ? "Business" : "Businesses"} approved to pitch`}
        </div>
      </div>
    </div>
  );
}
