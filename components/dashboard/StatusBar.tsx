type Props = {
  approvedCount: number;
  pitchesSent: number;
  repliesCount: number;
  activeLabel: string;
  isLive: boolean;
};

export function StatusBar({
  approvedCount,
  pitchesSent,
  repliesCount,
  activeLabel,
  isLive,
}: Props) {
  return (
    <div className="status-bar" role="status" aria-live="polite">
      <div className={`status-bar__live${isLive ? "" : " status-bar__live--gold"}`}>
        <span className="dot" />
        {isLive
          ? "LIVE · OUTREACH RUNNING"
          : "QUEUED · FIRST ROUND WITHIN 24H"}
      </div>
      <div className="status-bar__stats">
        <span>
          <strong>{pitchesSent}</strong> pitches sent
        </span>
        <span>
          <strong>{repliesCount}</strong> responses
        </span>
        <span>
          <strong>{approvedCount}</strong> on list
        </span>
        <span>{activeLabel}</span>
      </div>
    </div>
  );
}
