const ITEMS: { label: string; accent?: boolean }[] = [
  { label: "Division I" },
  { label: "Division II", accent: true },
  { label: "Division III" },
  { label: "JUCO", accent: true },
  { label: "NAIA" },
  { label: "High School", accent: true },
  { label: "Women's Athletics" },
  { label: "Club Sports", accent: true },
];

export function AudienceMarquee() {
  // Duplicate the list for a seamless loop.
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <section className="marquee">
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={i} style={{ display: "contents" }}>
            <span
              className={`marquee__item${item.accent ? " marquee__item--accent" : ""}`}
            >
              {item.label}
            </span>
            <span className="marquee__sep"></span>
          </span>
        ))}
      </div>
    </section>
  );
}
