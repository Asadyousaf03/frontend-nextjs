"use client";

import SequenceViewer from "@/components/SequenceViewer";
import { resolveQrdrContext } from "@/lib/qrdr";
import type { AnalysisResult, SusceptibilityLabel } from "@/types/genomic";

interface ReportDashboardProps {
  result: AnalysisResult;
}

function labelStyles(label: SusceptibilityLabel | string): string {
  if (label === "R") return "border-res/40 bg-res-soft text-res";
  if (label === "S") return "border-sus/40 bg-sus-soft text-sus";
  return "border-atu/40 bg-atu-soft text-atu";
}

function labelName(label: SusceptibilityLabel | string): string {
  if (label === "R") return "Resistant";
  if (label === "S") return "Susceptible";
  if (label === "I") return "Intermediate";
  if (label === "ATU") return "ATU / Area of technical uncertainty";
  return "Unknown";
}

function Gauge({
  value,
  tone,
  label,
}: {
  value: number;
  tone: "res" | "sus" | "atu" | "accent";
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const toneClass =
    tone === "res"
      ? "bg-res"
      : tone === "sus"
        ? "bg-sus"
        : tone === "atu"
          ? "bg-atu"
          : "bg-accent";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-all duration-700 ${toneClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ReportDashboard({ result }: ReportDashboardProps) {
  const { susceptibility, qc, variants, shap_features, interpretation } =
    result;
  const maxAbs = Math.max(
    ...shap_features.map((feature) => Math.abs(feature.shap_value)),
    0.01,
  );
  const verdictTone =
    susceptibility.label === "R"
      ? "res"
      : susceptibility.label === "S"
        ? "sus"
        : "atu";

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-border bg-surface-2/90 p-6 shadow-xl shadow-black/5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Ciprofloxacin · {susceptibility.breakpoint_standard}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {result.sample.sample_name}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {interpretation.summary}
            </p>
            {interpretation.key_drivers.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {interpretation.key_drivers.map((driver) => (
                  <li
                    key={driver}
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-foreground"
                  >
                    {driver}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`min-w-[10rem] rounded-2xl border px-5 py-4 text-center ${labelStyles(susceptibility.label)}`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              Prediction
            </div>
            <div className="mt-1 font-display text-5xl font-black tracking-tight">
              {susceptibility.label}
            </div>
            <div className="mt-1 text-xs font-medium">
              {labelName(susceptibility.label)}
            </div>
            <div className="mt-3 space-y-2 text-left">
              <Gauge
                value={susceptibility.probability_resistant}
                tone={verdictTone}
                label="P(Resistant)"
              />
              <Gauge
                value={susceptibility.confidence}
                tone="accent"
                label="Confidence"
              />
            </div>
          </div>
        </div>

        <p className="mt-5 rounded-xl border border-atu/30 bg-atu-soft/70 px-3 py-2 text-xs leading-relaxed text-atu">
          {interpretation.disclaimer}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            QC report
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">Passed</dt>
              <dd
                className={`mt-1 font-semibold ${qc.passed ? "text-sus" : "text-res"}`}
              >
                {qc.passed ? "Yes" : "No"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">Species</dt>
              <dd className="mt-1 font-medium text-foreground">
                {qc.species_call ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">Bases</dt>
              <dd className="mt-1 font-mono text-foreground">
                {qc.total_bases?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">N50</dt>
              <dd className="mt-1 font-mono text-foreground">
                {qc.n50?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">Contigs</dt>
              <dd className="mt-1 font-mono text-foreground">
                {qc.contig_count ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">GC</dt>
              <dd className="mt-1 font-mono text-foreground">
                {qc.gc_content != null
                  ? `${(qc.gc_content * 100).toFixed(1)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
          {qc.notes.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {qc.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Detected markers
          </h3>
          {variants.length === 0 ? (
            <p className="text-sm text-muted">
              No high-confidence fluoroquinolone markers detected.
            </p>
          ) : (
            <ul className="space-y-3">
              {variants.map((variant) => {
                const context = resolveQrdrContext(variant);
                return (
                  <li
                    key={`${variant.gene}-${variant.mutation}-${variant.source}`}
                    className="space-y-2 rounded-xl border border-border bg-surface/60 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-sm font-semibold text-foreground">
                          {variant.gene}
                          {variant.mutation ? ` ${variant.mutation}` : ""}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">
                          source: {variant.source}
                          {variant.associated_phenotype
                            ? ` · phenotype lean: ${variant.associated_phenotype}`
                            : ""}
                        </div>
                      </div>
                      {variant.associated_phenotype && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${labelStyles(variant.associated_phenotype)}`}
                        >
                          {variant.associated_phenotype}
                        </span>
                      )}
                    </div>
                    {context && (
                      <SequenceViewer context={context} compact />
                    )}
                    {variant.notes && (
                      <p className="text-[11px] text-muted">{variant.notes}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
          SHAP feature contributions
        </h3>
        <div className="space-y-3">
          {shap_features.map((feature) => {
            const width = `${(Math.abs(feature.shap_value) / maxAbs) * 100}%`;
            const color =
              feature.direction === "resistant"
                ? "bg-res"
                : feature.direction === "susceptible"
                  ? "bg-sus"
                  : "bg-muted";
            return (
              <div key={`${feature.rank}-${feature.feature}`}>
                <div className="mb-1 flex justify-between gap-3 text-xs text-muted">
                  <span className="truncate">
                    <span className="font-mono text-foreground/70">
                      #{feature.rank}
                    </span>{" "}
                    {feature.feature}
                  </span>
                  <span className="shrink-0 font-mono text-foreground">
                    {feature.shap_value.toFixed(4)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-mono uppercase tracking-wider text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-res" /> Resistant push
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-sus" /> Susceptible push
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Alternative drugs
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {interpretation.alternative_drugs.map((drug) => (
            <article
              key={drug.name}
              className="rounded-xl border border-border bg-surface/60 p-4"
            >
              <h4 className="font-display font-semibold text-foreground">
                {drug.name}
              </h4>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-accent">
                {drug.class_name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {drug.rationale}
              </p>
              {drug.caution && (
                <p className="mt-2 rounded-lg border border-atu/30 bg-atu-soft/60 px-2 py-1.5 text-xs text-atu">
                  Caution: {drug.caution}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/50 p-5 text-xs text-muted">
        <p className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-foreground/70">
          Limitations
        </p>
        <ul className="space-y-1">
          {interpretation.limitations.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[11px]">
          Pipeline:{" "}
          {Object.entries(result.pipeline_versions)
            .map(([key, value]) => `${key}=${value}`)
            .join(" · ")}
        </p>
      </section>
    </div>
  );
}
