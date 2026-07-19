import { isNucleotide, type QrdrContext } from "@/lib/qrdr";

interface SequenceViewerProps {
  context: QrdrContext;
  compact?: boolean;
}

function baseClass(base: string): string {
  switch (base) {
    case "A":
      return "bg-base-a/15 text-base-a ring-base-a/40";
    case "T":
      return "bg-base-t/15 text-base-t ring-base-t/40";
    case "C":
      return "bg-base-c/20 text-base-c ring-base-c/50";
    case "G":
      return "bg-base-g/15 text-base-g ring-base-g/40";
    default:
      return "bg-muted/10 text-muted";
  }
}

export default function SequenceViewer({
  context,
  compact = false,
}: SequenceViewerProps) {
  const bases = context.sequence.toUpperCase().split("");

  return (
    <div
      className={`rounded-xl border border-border bg-surface/70 ${compact ? "p-2.5" : "p-3"}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
          {context.label}
        </p>
        <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-muted">
          reference context
        </span>
      </div>

      <div className="flex flex-wrap gap-1 font-mono text-xs">
        {bases.map((base, index) => {
          const inCodon =
            index >= context.codonStart && index < context.codonStart + 3;
          const highlighted = index === context.highlightIndex;
          const color = isNucleotide(base)
            ? baseClass(base)
            : baseClass("N");

          return (
            <span
              key={`${index}-${base}`}
              title={`pos ${index + 1}: ${base}${highlighted ? " · mutated base" : ""}${inCodon ? " · codon" : ""}`}
              className={`inline-flex h-7 w-6 items-center justify-center rounded-md font-semibold transition ${color} ${
                highlighted
                  ? "ring-2 scale-110 shadow-sm"
                  : inCodon
                    ? "ring-1"
                    : ""
              }`}
            >
              {base}
            </span>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {context.note}
        {context.referenceAa !== context.mutantAa
          ? ` · ${context.referenceAa}${context.aaPosition}${context.mutantAa}`
          : ""}
      </p>

      {!compact && (
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-muted">
          <LegendDot className="bg-base-a" label="A" />
          <LegendDot className="bg-base-t" label="T" />
          <LegendDot className="bg-base-c" label="C" />
          <LegendDot className="bg-base-g" label="G" />
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm ring-2 ring-accent/60" />
            mutated
          </span>
        </div>
      )}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
