"use client";

import type { AnalysisEvent } from "@/types/genomic";

interface ProgressPanelProps {
  progress: number;
  stage?: string | null;
  events: AnalysisEvent[];
}

function levelColor(level: AnalysisEvent["level"]): string {
  if (level === "error") return "text-res";
  if (level === "warn") return "text-atu";
  if (level === "success") return "text-sus";
  return "text-muted";
}

const STAGE_LABELS: Record<string, string> = {
  queued: "Queued",
  qc: "Assembly QC",
  species: "Species panel",
  resfinder: "ResFinder inference",
  amrfinderplus: "AMRFinderPlus corroboration",
  reconcile: "Evidence reconciliation",
  interpretation: "Report interpretation",
  completed: "Completed",
  failed: "Failed",
};

function stageLabel(stage?: string | null): string {
  if (!stage) return "Queued";
  return STAGE_LABELS[stage] ?? stage;
}

export default function ProgressPanel({
  progress,
  stage,
  events,
}: ProgressPanelProps) {
  const percent = Math.round(progress * 100);

  return (
    <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-xl shadow-black/5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Pipeline progress
          </h2>
          <p className="mt-1 text-xs text-muted">
            Stage:{" "}
            <span className="font-medium text-accent">{stageLabel(stage)}</span>
          </p>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent-soft/50 px-3 py-1 font-mono text-sm font-semibold text-accent">
          {percent}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Analysis progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mb-4 h-2.5 overflow-hidden rounded-full bg-surface"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-base-t transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div
        aria-live="polite"
        className="scrollbar-thin max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-surface/70 p-3 font-mono text-xs"
      >
        {events.length === 0 ? (
          <p className="text-muted">Waiting for pipeline events…</p>
        ) : (
          events.map((event) => (
            <div key={event.sequence} className="flex gap-2 leading-relaxed">
              <span className="shrink-0 text-muted/70">
                [{String(event.sequence).padStart(2, "0")}]
              </span>
              <span className={levelColor(event.level)}>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
