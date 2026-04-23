const ROWS: { biz: string; city: string; on: boolean }[] = [
  { biz: "Main Street Barber Co.", city: "Waco, TX", on: true },
  { biz: "Revolution CrossFit", city: "Waco, TX", on: true },
  { biz: "Duke's Burgers", city: "Waco, TX", on: false },
  { biz: "Ranch Auto Detailing", city: "Waco, TX", on: true },
  { biz: "Coach Taylor's Pizza", city: "Waco, TX", on: false },
  { biz: "La Cocina de Abuela", city: "Waco, TX", on: true },
];

export function YourCall() {
  return (
    <section className="control section">
      <div className="container-page">
        <div className="control__grid">
          <div>
            <span className="label">03 / YOUR CALL</span>
            <h2 style={{ marginTop: "1.25rem" }}>
              You control <span className="accent-green">who we pitch.</span>
              <br />
              Always.
            </h2>
            <p className="lede" style={{ marginTop: "1.25rem" }}>
              #1 worry we hear: &quot;What if it goes to the wrong person and I get
              embarrassed?&quot; The whole system is built around that fear.
            </p>

            <ul className="control__points">
              <li>
                <span className="control__points-num">01</span>
                <div className="control__points-text">
                  <strong>See your full list first.</strong>
                  Every business we pull is shown to you before a single email sends. No
                  surprises. Nothing hidden.
                </div>
              </li>
              <li>
                <span className="control__points-num">02</span>
                <div className="control__points-text">
                  <strong>Remove anyone you don&apos;t want.</strong>
                  One click takes any business off your list permanently. Remove individuals
                  or entire categories. They&apos;re never contacted.
                </div>
              </li>
              <li>
                <span className="control__points-num">03</span>
                <div className="control__points-text">
                  <strong>Preview the pitch tone.</strong>
                  Sample pitch in your voice — professional, casual, or hyped. Nothing goes
                  out that doesn&apos;t sound like you.
                </div>
              </li>
              <li>
                <span className="control__points-num">04</span>
                <div className="control__points-text">
                  <strong>You build the menu. We deliver the pitches.</strong>
                  At signup, you check the boxes for deal types you&apos;ll accept — cash per
                  post, product deals, appearances. We pitch your menu to local businesses.
                  Yes-responses become contracts with your original terms. Counter-offers come
                  back to you to accept, reject, or counter back. You never negotiate — we
                  just deliver the messages.
                </div>
              </li>
            </ul>
          </div>

          <div className="app-mock">
            <div className="app-mock__head">
              <div className="app-mock__title">Target list · Review</div>
              <div className="app-mock__count">47 / 163 APPROVED</div>
            </div>
            <div className="app-mock__body">
              {ROWS.map((r) => (
                <div className="app-mock__row" key={r.biz}>
                  <div className="app-mock__biz">
                    {r.biz}
                    <small>{r.city}</small>
                  </div>
                  <div className={`toggle${r.on ? " toggle--on" : ""}`}></div>
                </div>
              ))}
            </div>
            <div className="app-mock__foot">
              <span className="app-mock__status">
                <strong>● LIVE</strong> — 116 MORE TO REVIEW
              </span>
              <button className="btn btn--primary btn--sm">Approve all &amp; send →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
