"use client";

import { Fragment, useMemo, useState } from "react";
import SequenceViewer from "@/components/SequenceViewer";
import { resolveQrdrContext } from "@/lib/qrdr";
import type {
  AnalysisResult,
  AntimicrobialCall,
  InterpretationReference,
  ResistanceEvidence,
  SusceptibilityLabel,
} from "@/types/genomic";

interface ReportDashboardProps {
  result: AnalysisResult;
}

function labelStyles(label: SusceptibilityLabel | string | null | undefined): string {
  if (label === "R") return "border-res/40 bg-res-soft text-res";
  if (label === "S") return "border-sus/40 bg-sus-soft text-sus";
  if (label === "I" || label === "ATU") return "border-atu/40 bg-atu-soft text-atu";
  return "border-border bg-surface text-muted";
}

function agreementStyles(agreement: string): string {
  if (agreement === "concordant" || agreement === "complementary") {
    return "text-sus";
  }
  if (agreement === "discordant" || agreement === "tool_failure") {
    return "text-res";
  }
  if (agreement === "single_source") return "text-atu";
  return "text-muted";
}

function verdictStyles(verdict: string): { badge: string; ring: string; label: string } {
  if (verdict === "PASS") {
    return {
      badge: "border-sus/40 bg-sus-soft text-sus",
      ring: "border-sus/30 bg-sus-soft/40",
      label: "PASS",
    };
  }
  if (verdict === "WARN") {
    return {
      badge: "border-atu/40 bg-atu-soft text-atu",
      ring: "border-atu/30 bg-atu-soft/40",
      label: "WARN",
    };
  }
  return {
    badge: "border-res/40 bg-res-soft text-res",
    ring: "border-res/30 bg-res-soft/40",
    label: "FAIL",
  };
}

function ReferenceChip({ ref }: { ref: InterpretationReference }) {
  const parts: string[] = [ref.source];
  if (ref.version) parts.push(`v${ref.version}`);
  if (ref.database_version) parts.push(`db ${ref.database_version}`);
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
      {parts.join(" · ")}
    </span>
  );
}

export default function ReportDashboard({ result }: ReportDashboardProps) {
  const antibiogram = useMemo(
    () => result.antibiogram ?? [],
    [result.antibiogram],
  );
  const evidence = useMemo(() => result.evidence ?? [], [result.evidence]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(
    () =>
      antibiogram.find((item) => item.label === "R")?.drug_id ??
      antibiogram[0]?.drug_id ??
      "",
  );
  const selected = useMemo(
    () => antibiogram.find((item) => item.drug_id === selectedId) ?? antibiogram[0],
    [antibiogram, selectedId],
  );
  const selectedEvidence = useMemo(() => {
    if (!selected) return [] as ResistanceEvidence[];
    const ids = new Set(selected.evidence_ids);
    return evidence.filter((item) => ids.has(item.evidence_id));
  }, [evidence, selected]);

  const counts = useMemo(() => {
    const base = { R: 0, S: 0, unknown: 0, conflict: 0 };
    for (const item of antibiogram) {
      if (item.label === "R") base.R += 1;
      else if (item.label === "S") base.S += 1;
      else if (item.call_status === "conflicting") base.conflict += 1;
      else base.unknown += 1;
    }
    return base;
  }, [antibiogram]);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-border bg-surface-2/90 p-6 shadow-xl shadow-black/5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Multi-pathogen genomic antibiogram · research use only
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {result.sample.sample_name}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Organism:{" "}
              <span className="font-medium text-foreground">
                {result.organism?.scientific_name ?? result.sample.organism}
              </span>
              {result.organism ? (
                <span className="text-muted">
                  {" "}
                  · ResFinder panel + AMRFinderPlus corroboration
                </span>
              ) : null}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
              {result.interpretation.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full border px-2.5 py-1 ${labelStyles("R")}`}>
                R {counts.R}
              </span>
              <span className={`rounded-full border px-2.5 py-1 ${labelStyles("S")}`}>
                S {counts.S}
              </span>
              <span className={`rounded-full border px-2.5 py-1 ${labelStyles("unknown")}`}>
                Unknown {counts.unknown}
              </span>
              <span className={`rounded-full border px-2.5 py-1 ${labelStyles("ATU")}`}>
                Conflict {counts.conflict}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-5 rounded-xl border border-atu/30 bg-atu-soft/70 px-3 py-2 text-xs leading-relaxed text-atu">
          {result.interpretation.disclaimer}
        </p>
      </section>

      <QcVerdictBanner qc={result.qc} />

      <DualAudiencePanel interpretation={result.interpretation} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Antibiogram
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="pb-2 pr-3"></th>
                  <th className="pb-2 pr-3">Drug</th>
                  <th className="pb-2 pr-3">Call</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Agreement</th>
                  <th className="pb-2 pr-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {antibiogram.map((item) => {
                  const isOpen = expandedId === item.drug_id;
                  const linkedEvidence = evidence.filter((e) =>
                    item.evidence_ids.includes(e.evidence_id),
                  );
                  return (
                    <Fragment key={item.drug_id}>
                      <tr
                        className={`cursor-pointer border-t border-border/70 transition hover:bg-surface/80 ${
                          selected?.drug_id === item.drug_id ? "bg-surface/90" : ""
                        }`}
                        onClick={() => {
                          setSelectedId(item.drug_id);
                          setExpandedId(isOpen ? null : item.drug_id);
                        }}
                      >
                        <td className="py-2.5 pr-3 align-top text-xs text-muted">
                          <span className="inline-block transition-transform">
                            {isOpen ? "▾" : "▸"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-foreground">{item.drug}</div>
                          <div className="text-[11px] text-muted">
                            {item.drug_class ?? "—"}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${labelStyles(item.label)}`}
                          >
                            {item.label ?? "—"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-muted">
                          {item.call_status}
                        </td>
                        <td
                          className={`py-2.5 pr-3 text-xs font-medium ${agreementStyles(item.agreement)}`}
                        >
                          {item.agreement}
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-muted">
                          {item.confidence_category}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-t border-border/40 bg-surface/60">
                          <td></td>
                          <td colSpan={5} className="py-3 pr-3">
                            <CallEvidence
                              call={item}
                              evidence={linkedEvidence}
                              organismId={result.organism?.organism_id}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <DrugDetail
          selected={selected}
          evidence={selectedEvidence}
          organismId={result.organism?.organism_id}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            QC
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">Passed</dt>
              <dd
                className={`mt-1 font-semibold ${result.qc.passed ? "text-sus" : "text-res"}`}
              >
                {result.qc.passed ? "Yes" : "No"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">Bases</dt>
              <dd className="mt-1 font-mono text-foreground">
                {result.qc.total_bases?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">N50</dt>
              <dd className="mt-1 font-mono text-foreground">
                {result.qc.n50?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 p-3">
              <dt className="text-xs text-muted">GC</dt>
              <dd className="mt-1 font-mono text-foreground">
                {result.qc.gc_content != null
                  ? `${(result.qc.gc_content * 100).toFixed(1)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
          {result.qc.notes.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {result.qc.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Tool provenance
          </h3>
          <ul className="space-y-3">
            {(result.tool_runs ?? []).map((run) => (
              <li
                key={`${run.tool}-${run.role}`}
                className="rounded-xl border border-border bg-surface/60 p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{run.tool}</span>
                  <span
                    className={
                      run.status === "success" ? "text-sus" : "text-res"
                    }
                  >
                    {run.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{run.role}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  v{run.version ?? "?"} · db {run.database_version ?? "?"}
                </p>
                {run.disclaimer && (
                  <p className="mt-2 text-[11px] text-atu">{run.disclaimer}</p>
                )}
              </li>
            ))}
            {(result.tool_runs ?? []).length === 0 && (
              <li className="text-sm text-muted">
                Legacy result without structured tool provenance.
              </li>
            )}
          </ul>
        </section>
      </section>

      <section className="rounded-2xl border border-border bg-surface/50 p-5 text-xs text-muted">
        <p className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-foreground/70">
          Limitations
        </p>
        <ul className="space-y-1">
          {result.interpretation.limitations.map((item) => (
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

function DrugDetail({
  selected,
  evidence,
  organismId,
}: {
  selected?: AntimicrobialCall;
  evidence: ResistanceEvidence[];
  organismId?: string;
}) {
  if (!selected) {
    return (
      <section className="rounded-2xl border border-border bg-surface-2/80 p-5 text-sm text-muted">
        No antibiogram calls available.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
      <h3 className="font-display text-lg font-semibold text-foreground">
        {selected.drug}
      </h3>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">
        {selected.drug_class ?? "unclassified"} · {selected.confidence_category}{" "}
        confidence
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${labelStyles(selected.label)}`}
        >
          {selected.label ?? "no call"}
        </span>
        <span className={`text-sm font-medium ${agreementStyles(selected.agreement)}`}>
          {selected.agreement}
        </span>
        <span className="text-sm text-muted">{selected.call_status}</span>
      </div>

      <div className="mt-4 space-y-2">
        {selected.source_assessments.map((assessment) => (
          <div
            key={`${assessment.source}-${assessment.status}`}
            className="rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs"
          >
            <span className="font-semibold text-foreground">
              {assessment.source}
            </span>
            <span className="text-muted"> · {assessment.status}</span>
            {assessment.label ? (
              <span className="text-muted"> · lean {assessment.label}</span>
            ) : null}
          </div>
        ))}
      </div>

      {selected.warnings.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs text-atu">
          {selected.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Supporting evidence
        </h4>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted">
            No linked determinants for this drug.
          </p>
        ) : (
          evidence.map((item) => {
            const context =
              organismId === "escherichia_coli"
                ? resolveQrdrContext({
                    gene: item.gene,
                    mutation: item.mutation,
                    source: item.source,
                  })
                : null;
            return (
              <div
                key={item.evidence_id}
                className="rounded-xl border border-border bg-surface/60 p-3"
              >
                <div className="text-sm font-semibold text-foreground">
                  {item.gene}
                  {item.mutation ? ` ${item.mutation}` : ""}
                </div>
                <div className="mt-1 text-[11px] text-muted">
                  {item.source}
                  {item.identity != null
                    ? ` · identity ${(item.identity * 100).toFixed(1)}%`
                    : ""}
                  {item.coverage != null
                    ? ` · coverage ${(item.coverage * 100).toFixed(1)}%`
                    : ""}
                </div>
                {context && <div className="mt-2"><SequenceViewer context={context} compact /></div>}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function QcVerdictBanner({ qc }: { qc: AnalysisResult["qc"] }) {
  const verdict = qc.verdict ?? (qc.passed ? "PASS" : "FAIL");
  const styles = verdictStyles(verdict);
  const reasons = qc.verdict_reasons ?? [];
  return (
    <section
      className={`rounded-2xl border p-5 shadow-lg shadow-black/5 ${styles.ring}`}
      aria-label="FASTA file validation verdict"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-sm font-bold tracking-wider ${styles.badge}`}
        >
          {styles.label}
        </span>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground/80">
          FASTA file validation
        </h3>
        <span className="text-xs text-muted">
          {verdict === "PASS"
            ? "This file looks usable for genomic AST."
            : verdict === "WARN"
              ? "Usable, but with caveats — read below."
              : "This file is not usable for genomic AST."}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface/60 p-3">
          <dt className="text-xs text-muted">Bases</dt>
          <dd className="mt-1 font-mono text-foreground">
            {qc.total_bases?.toLocaleString() ?? "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-3">
          <dt className="text-xs text-muted">Records</dt>
          <dd className="mt-1 font-mono text-foreground">
            {qc.contig_count?.toLocaleString() ?? qc.header_count?.toLocaleString() ?? "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-3">
          <dt className="text-xs text-muted">GC content</dt>
          <dd className="mt-1 font-mono text-foreground">
            {qc.gc_content != null ? `${(qc.gc_content * 100).toFixed(1)}%` : "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-3">
          <dt className="text-xs text-muted">N (ambiguous) bases</dt>
          <dd className="mt-1 font-mono text-foreground">
            {qc.n_content != null ? `${(qc.n_content * 100).toFixed(2)}%` : "—"}
          </dd>
        </div>
      </dl>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs leading-relaxed text-muted">
          {reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DualAudiencePanel({
  interpretation,
}: {
  interpretation: AnalysisResult["interpretation"];
}) {
  const [audience, setAudience] = useState<"clinician" | "layperson">("clinician");
  const clinician = interpretation.clinician_summary ?? interpretation.summary;
  const layperson = interpretation.layperson_summary ?? null;
  const refs = interpretation.references ?? [];

  return (
    <section className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Interpretation
        </h3>
        <div
          role="tablist"
          className="inline-flex rounded-full border border-border bg-surface p-0.5 text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={audience === "clinician"}
            onClick={() => setAudience("clinician")}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              audience === "clinician"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            For clinicians
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === "layperson"}
            onClick={() => setAudience("layperson")}
            disabled={!layperson}
            className={`rounded-full px-3 py-1 font-semibold transition disabled:opacity-40 ${
              audience === "layperson"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Plain English
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground">
        {audience === "clinician" ? clinician : layperson ?? clinician}
      </p>

      {audience === "layperson" && (
        <p className="mt-3 rounded-xl border border-atu/30 bg-atu-soft/60 px-3 py-2 text-xs leading-relaxed text-atu">
          R = Resistant (the medicine likely won&apos;t work). S = Susceptible (the
          medicine likely will work, but a lab must still confirm). Unknown = the
          result is uncertain.
        </p>
      )}

      {refs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            References (how we reached these conclusions)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {refs.map((ref) => (
              <ReferenceChip key={ref.source} ref={ref} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CallEvidence({
  call,
  evidence,
  organismId,
}: {
  call: AntimicrobialCall;
  evidence: ResistanceEvidence[];
  organismId?: string;
}) {
  const refs = call.references ?? [];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            For clinicians
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground">
            {call.clinician_rationale ??
              "No clinician rationale attached for this call."}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Plain English
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground">
            {call.layperson_rationale ??
              "No plain-language explanation attached for this call."}
          </p>
        </div>
      </div>

      {refs.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            References
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {refs.map((ref) => (
              <ReferenceChip key={ref.source} ref={ref} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Supporting evidence ({evidence.length})
        </p>
        {evidence.length === 0 ? (
          <p className="mt-1 text-xs text-muted">
            No linked resistance determinants for this drug.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {evidence.map((item) => {
              const context =
                organismId === "escherichia_coli"
                  ? resolveQrdrContext({
                      gene: item.gene,
                      mutation: item.mutation,
                      source: item.source,
                    })
                  : null;
              return (
                <div
                  key={item.evidence_id}
                  className="rounded-xl border border-border bg-surface/60 p-3"
                >
                  <div className="text-sm font-semibold text-foreground">
                    {item.gene}
                    {item.mutation ? ` ${item.mutation}` : ""}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {item.source}
                    {item.identity != null
                      ? ` · identity ${(item.identity * 100).toFixed(1)}%`
                      : ""}
                    {item.coverage != null
                      ? ` · coverage ${(item.coverage * 100).toFixed(1)}%`
                      : ""}
                    {item.accession ? ` · acc ${item.accession}` : ""}
                  </div>
                  {context && (
                    <div className="mt-2">
                      <SequenceViewer context={context} compact />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {call.warnings.length > 0 && (
        <ul className="space-y-1 text-xs text-atu">
          {call.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
