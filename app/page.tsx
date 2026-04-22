export default function Home() {
  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.2em] text-text-muted mb-6 uppercase">
          <span className="text-green">●</span> Building in public · Coming soon
        </p>

        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wide uppercase leading-none mb-6">
          NIL<span className="text-green">PRO</span>
        </h1>

        <p className="font-cond text-xl sm:text-2xl uppercase tracking-wider text-text-dim mb-4">
          Endorsement deals for every athlete.
        </p>

        <p className="text-text-dim text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          NILPro helps student-athletes — from high school through college —
          reach local businesses about small endorsement partnerships.
          Software, not an agency. Launching soon.
        </p>

        <div className="mt-12 font-mono text-[11px] tracking-[0.2em] text-text-faint uppercase">
          thenilpro.com
        </div>
      </div>
    </main>
  );
}
