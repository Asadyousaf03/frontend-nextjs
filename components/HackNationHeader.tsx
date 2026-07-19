import DnaHelix from "@/components/DnaHelix";
import ThemeToggle from "@/components/ThemeToggle";

export default function HackNationHeader() {
  return (
    <header className="relative mb-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-[18%] top-8 h-28 w-48 rounded-full bg-base-t/10 blur-3xl" />
        <div className="absolute right-[12%] top-4 h-32 w-40 rounded-full bg-base-a/10 blur-3xl" />
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Hack Nation 2026
        </div>
        <ThemeToggle />
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="text-left">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-accent via-base-t to-base-a bg-clip-text text-transparent">
              Hack Nation AI
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Multi-pathogen genomic antibiogram —{" "}
            <span className="font-medium text-foreground">ResFinder</span>{" "}
            phenotype inference with{" "}
            <span className="font-medium text-foreground">AMRFinderPlus</span>{" "}
            corroboration across supported bacterial panels.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-wider text-muted">
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1">
              Multi-drug antibiogram
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1">
              R / S / ATU / unknown
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1">
              Research use only
            </span>
          </div>
        </div>

        <DnaHelix size="md" className="mx-auto opacity-90 md:mx-0" />
      </div>
    </header>
  );
}
