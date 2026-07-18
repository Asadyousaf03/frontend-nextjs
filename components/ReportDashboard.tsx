"use client";

import type { AnalysisResult } from "@/types/genomic";

interface ReportDashboardProps {
  result: AnalysisResult;
}

function labelStyles(label: string): string {
  if (label === "R") return "border-rose-500/40 bg-rose-500/15 text-rose-300";
  if (label === "S")
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  return "border-amber-500/40 bg-amber-500/15 text-amber-300";
}

export default function ReportDashboard({ result }: ReportDashboardProps) {
  const { susceptibility, qc, variants, shap_features, interpretation } = result;
  const maxAbs = Math.max(
    ...shap_features.map((feature) => Math.abs(feature.shap_value)),
    0.01,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Ciprofloxacin · {susceptibility.breakpoint_standard}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">
              {result.sample.sample_name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              {interpretation.summary}
            </p>
          </div>
          <div
            className={`rounded-2xl border px-5 py-4 text-center ${labelStyles(susceptibility.label)}`}
          >
            <div className="text-xs uppercase tracking-wider">Prediction</div>
            <div className="mt-1 text-4xl font-black">
              {susceptibility.label}
            </div>
            <div className="mt-2 text-xs">
              P(R) {(susceptibility.probability_resistant * 100).toFixed(1)}%
            </div>
            <div className="text-xs opacity-80">
              confidence {(susceptibility.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {interpretation.disclaimer}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            QC report
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Passed</dt>
              <dd className={qc.passed ? "text-emerald-300" : "text-rose-300"}>
                {qc.passed ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Species</dt>
              <dd className="text-slate-200">{qc.species_call ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Bases</dt>
              <dd className="text-slate-200">
                {qc.total_bases?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">N50</dt>
              <dd className="text-slate-200">
                {qc.n50?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Contigs</dt>
              <dd className="text-slate-200">{qc.contig_count ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">GC</dt>
              <dd className="text-slate-200">
                {qc.gc_content != null
                  ? `${(qc.gc_content * 100).toFixed(1)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
          {qc.notes.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs text-slate-400">
              {qc.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Detected markers
          </h3>
          {variants.length === 0 ? (
            <p className="text-sm text-slate-500">
              No high-confidence fluoroquinolone markers detected.
            </p>
          ) : (
            <ul className="space-y-2">
              {variants.map((variant) => (
                <li
                  key={`${variant.gene}-${variant.mutation}-${variant.source}`}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm"
                >
                  <div className="font-medium text-slate-100">
                    {variant.gene}
                    {variant.mutation ? ` ${variant.mutation}` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    source: {variant.source}
                    {variant.associated_phenotype
                      ? ` · phenotype lean: ${variant.associated_phenotype}`
                      : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          SHAP feature contributions
        </h3>
        <div className="space-y-3">
          {shap_features.map((feature) => {
            const width = `${(Math.abs(feature.shap_value) / maxAbs) * 100}%`;
            const color =
              feature.direction === "resistant"
                ? "bg-rose-500"
                : feature.direction === "susceptible"
                  ? "bg-emerald-500"
                  : "bg-slate-500";
            return (
              <div key={`${feature.rank}-${feature.feature}`}>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>
                    #{feature.rank} {feature.feature}
                  </span>
                  <span>{feature.shap_value.toFixed(4)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Alternative drugs
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {interpretation.alternative_drugs.map((drug) => (
            <article
              key={drug.name}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <h4 className="font-semibold text-slate-100">{drug.name}</h4>
              <p className="text-xs uppercase tracking-wider text-cyan-400">
                {drug.class_name}
              </p>
              <p className="mt-2 text-sm text-slate-300">{drug.rationale}</p>
              {drug.caution && (
                <p className="mt-2 text-xs text-amber-300">⚠ {drug.caution}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-xs text-slate-500">
        <p className="mb-2 font-semibold uppercase tracking-wider text-slate-400">
          Limitations
        </p>
        <ul className="space-y-1">
          {interpretation.limitations.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-3">
          Pipeline: {Object.entries(result.pipeline_versions)
            .map(([key, value]) => `${key}=${value}`)
            .join(" · ")}
        </p>
      </section>
    </div>
  );
}
