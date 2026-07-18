export default function HackNationHeader() {
  return (
    <header className="relative mb-8 overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute left-1/3 top-6 h-28 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Hack Nation 2026
      </div>

      <h1 className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
        Hack Nation AI
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
        Genomic antimicrobial susceptibility predictor for Escherichia coli
        ciprofloxacin resistance
      </p>
    </header>
  );
}
