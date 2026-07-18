"use client";

import type { AnalysisEvent } from "@/types/genomic";

interface ProgressPanelProps {
  progress: number;
  stage?: string | null;
  events: AnalysisEvent[];
}

export default function ProgressPanel({
  progress,
  stage,
  events,
}: ProgressPanelProps) {
  const percent = Math.round(progress * 100);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Pipeline progress
        </h2>
        <span className="text-sm text-emerald-400">{percent}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mb-3 text-sm text-slate-300">
        Stage: <span className="text-emerald-300">{stage ?? "queued"}</span>
      </p>
      <div className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-slate-400">
        {events.map((event) => (
          <div key={event.sequence}>
            <span className="text-slate-600">
              [{String(event.sequence).padStart(2, "0")}]
            </span>{" "}
            {event.message}
          </div>
        ))}
      </div>
    </section>
  );
}
