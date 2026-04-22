type Props = {
  eyebrow: string;
  title: string;
  accent?: string;
  body: string;
};

export function PlaceholderHero({ eyebrow, title, accent, body }: Props) {
  return (
    <section className="section">
      <div className="container-page">
        <span className="label">{eyebrow}</span>
        <h1 className="mt-6 mb-4">
          {title}
          {accent ? <span className="accent-green"> {accent}</span> : null}
        </h1>
        <p className="lede max-w-2xl">{body}</p>
        <div className="mt-10 inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-text-faint uppercase">
          <span className="text-green">●</span> Page under construction — full content shipping soon
        </div>
      </div>
    </section>
  );
}
