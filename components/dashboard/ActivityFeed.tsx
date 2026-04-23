type FeedEntry =
  | { kind: "yes"; biz: string; body: string; amount?: string; time: string }
  | { kind: "counter"; biz: string; body: string; time: string }
  | { kind: "no"; biz: string; body: string; time: string }
  | { kind: "pitch"; body: string; time: string }
  | { kind: "ref"; body: string; time: string }
  | { kind: "queue"; body: string; time: string };

type Props = {
  entries: FeedEntry[];
  /** True when the account is brand new and we want to render an empty state. */
  showEmpty: boolean;
};

export function ActivityFeed({ entries, showEmpty }: Props) {
  return (
    <div className="dash-panel">
      <div className="dash-panel__head">
        <div className="dash-panel__title">Live activity</div>
        <div className="dash-panel__meta">LAST 24H</div>
      </div>
      <div className="dash-panel__body">
        {showEmpty || entries.length === 0 ? (
          <EmptyState />
        ) : (
          entries.map((e, i) => <FeedRow key={i} entry={e} />)
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="feed-empty">
      <div className="feed-empty__tag">
        <span className="dot" /> QUEUED
      </div>
      <div className="feed-empty__title">Your first round is queued</div>
      <p className="feed-empty__body">
        We&apos;re drafting personalized pitches for the businesses on your
        list. First outreach ships within 24 hours — we&apos;ll email you the
        moment a reply lands.
      </p>
    </div>
  );
}

function FeedRow({ entry }: { entry: FeedEntry }) {
  if (entry.kind === "yes") {
    return (
      <div className="feed-item">
        <div className="feed-tag feed-tag--yes">Yes</div>
        <div className="feed-body">
          <span className="biz">{entry.biz}</span> — {entry.body}
          {entry.amount ? <> · <span className="amt">{entry.amount}</span></> : null}
        </div>
        <div className="feed-time">{entry.time}</div>
      </div>
    );
  }
  if (entry.kind === "counter") {
    return (
      <div className="feed-item">
        <div className="feed-tag feed-tag--counter">Counter</div>
        <div className="feed-body">
          <span className="biz">{entry.biz}</span> — {entry.body}
        </div>
        <div className="feed-time">{entry.time}</div>
      </div>
    );
  }
  if (entry.kind === "no") {
    return (
      <div className="feed-item">
        <div className="feed-tag feed-tag--no">No</div>
        <div className="feed-body">
          <span className="biz">{entry.biz}</span> — {entry.body}
        </div>
        <div className="feed-time">{entry.time}</div>
      </div>
    );
  }
  if (entry.kind === "pitch") {
    return (
      <div className="feed-item">
        <div className="feed-tag feed-tag--pitch">Pitched</div>
        <div className="feed-body">{entry.body}</div>
        <div className="feed-time">{entry.time}</div>
      </div>
    );
  }
  if (entry.kind === "ref") {
    return (
      <div className="feed-item">
        <div className="feed-tag feed-tag--ref">Referral</div>
        <div className="feed-body">{entry.body}</div>
        <div className="feed-time">{entry.time}</div>
      </div>
    );
  }
  return (
    <div className="feed-item">
      <div className="feed-tag feed-tag--queue">Queued</div>
      <div className="feed-body">{entry.body}</div>
      <div className="feed-time">{entry.time}</div>
    </div>
  );
}
