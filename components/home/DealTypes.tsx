export function DealTypes() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="section-head">
          <span className="label">02 / THE BOARD</span>
          <h2>
            Small deals <span className="accent-green">that stack up.</span>
          </h2>
          <p className="section-head__lede">
            No one&apos;s getting a Gatorade contract. But a free meal every week, a gym
            membership, $200 for a social post, and a local retainer — that&apos;s real money
            in your pocket.
          </p>
        </div>

        <div className="deals__grid">
          <div className="deal-slip">
            <div className="deal-slip__head">
              <div className="deal-slip__kicker">
                <span className="deal-slip__type">TYPE 01 — CASH</span>
                <span className="deal-slip__num">•</span>
              </div>
              <h3>Cash deals</h3>
            </div>
            <div className="deal-slip__rows">
              <div className="deal-slip__row">
                <span className="deal-slip__label">Single social post</span>
                <span className="deal-slip__amt">$1–500</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Post series (3–5 posts)</span>
                <span className="deal-slip__amt">$1–500</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">In-store appearance</span>
                <span className="deal-slip__amt">$1–500</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Event appearance</span>
                <span className="deal-slip__amt">$1–500</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Monthly partnership</span>
                <span className="deal-slip__amt">$25–1K</span>
              </div>
            </div>
            <div className="deal-slip__foot">
              Cash goes <strong>DIRECTLY TO YOU</strong> · We never hold your money
            </div>
          </div>

          <div className="deal-slip">
            <div className="deal-slip__head">
              <div className="deal-slip__kicker">
                <span className="deal-slip__type">TYPE 02 — PRODUCT</span>
                <span className="deal-slip__num">•</span>
              </div>
              <h3>Product &amp; service</h3>
            </div>
            <div className="deal-slip__rows">
              <div className="deal-slip__row">
                <span className="deal-slip__label">Meals at local spots</span>
                <span className="deal-slip__amt deal-slip__amt--gold">Weekly–Monthly</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Gym / studio access</span>
                <span className="deal-slip__amt deal-slip__amt--gold">Monthly–Seasonal</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Haircut / beauty</span>
                <span className="deal-slip__amt deal-slip__amt--gold">Per visit</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Gear &amp; apparel</span>
                <span className="deal-slip__amt deal-slip__amt--gold">One-time</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Family discounts</span>
                <span className="deal-slip__amt deal-slip__amt--gold">Ongoing</span>
              </div>
            </div>
            <div className="deal-slip__foot">
              Exact frequency is whatever you agree on · <strong>EASIEST TO CLOSE</strong> for
              first-time athletes
            </div>
          </div>

          <div className="deal-slip">
            <div className="deal-slip__head">
              <div className="deal-slip__kicker">
                <span className="deal-slip__type">TYPE 03 — EXPOSURE</span>
                <span className="deal-slip__num">•</span>
              </div>
              <h3>Exposure + promo</h3>
            </div>
            <div className="deal-slip__rows">
              <div className="deal-slip__row">
                <span className="deal-slip__label">Meet-and-greet events</span>
                <span className="deal-slip__amt deal-slip__amt--neutral">EXPOSURE</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Business social feature</span>
                <span className="deal-slip__amt deal-slip__amt--neutral">REACH</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">In-store signage</span>
                <span className="deal-slip__amt deal-slip__amt--neutral">VISIBILITY</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Charity partnerships</span>
                <span className="deal-slip__amt deal-slip__amt--neutral">COMMUNITY</span>
              </div>
              <div className="deal-slip__row">
                <span className="deal-slip__label">Mutual shoutouts</span>
                <span className="deal-slip__amt deal-slip__amt--neutral">ZERO-COST</span>
              </div>
            </div>
            <div className="deal-slip__foot">
              Build your portfolio · <strong>EARN BIGGER DEALS</strong> down the line
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
