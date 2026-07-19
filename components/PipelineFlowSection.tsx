"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";

const PipelineFlow = dynamic(() => import("@/components/PipelineFlow"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-2xl border border-border bg-surface/40 text-sm text-muted">
      Loading pipeline diagram…
    </div>
  ),
});

export default function PipelineFlowSection() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface-2/70 shadow-lg shadow-black/5 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition hover:bg-surface/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Pipeline data flow
          </h2>
          <p className="mt-1 text-xs text-muted">
            Interactive map of the genomic AST pipeline · drag, edit & export
          </p>
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-border px-5 pb-5 pt-4">
          <PipelineFlow />
        </div>
      )}
    </section>
  );
}
