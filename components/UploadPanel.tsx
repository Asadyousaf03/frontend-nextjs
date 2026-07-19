"use client";

import type {
  FileFormat,
  ReadType,
  SampleMetadata,
  SpeciesCapability,
} from "@/types/genomic";

interface UploadPanelProps {
  sampleName: string;
  setSampleName: (value: string) => void;
  organism: string;
  setOrganism: (value: string) => void;
  species: SpeciesCapability[];
  readType: ReadType;
  setReadType: (value: ReadType) => void;
  fileFormat: FileFormat;
  setFileFormat: (value: FileFormat) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  disabled: boolean;
  onSubmit: () => void;
  toolsReady?: boolean;
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60";

export default function UploadPanel({
  sampleName,
  setSampleName,
  organism,
  setOrganism,
  species,
  readType,
  setReadType,
  fileFormat,
  setFileFormat,
  file,
  setFile,
  disabled,
  onSubmit,
  toolsReady = true,
}: UploadPanelProps) {
  const selected = species.find(
    (item) =>
      item.scientific_name === organism || item.organism_id === organism,
  );

  return (
    <section className="rounded-2xl border border-border bg-surface-2/80 p-6 shadow-xl shadow-black/5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Genomic sample intake
          </h2>
          <p className="mt-1 text-xs text-muted">
            Assembled FASTA only · select expected organism for ResFinder panel
          </p>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent-soft/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          Step 1
        </span>
      </div>

      {!toolsReady && (
        <p className="mb-4 rounded-xl border border-atu/30 bg-atu-soft/70 px-3 py-2 text-xs text-atu">
          Scientific tools are not ready on this API. Use Docker/Modal with
          pinned ResFinder + AMRFinderPlus, or enable fixture mode for demos.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground sm:col-span-2">
          Sample name
          <input
            value={sampleName}
            onChange={(event) => setSampleName(event.target.value)}
            disabled={disabled}
            className={fieldClass}
            placeholder="e.g. isolate 2026-001"
          />
        </label>

        <label className="block text-sm font-medium text-foreground sm:col-span-2">
          Expected organism
          <select
            value={organism}
            onChange={(event) => setOrganism(event.target.value)}
            disabled={disabled || species.length === 0}
            className={fieldClass}
          >
            {species.length === 0 ? (
              <option value="">Loading species panels…</option>
            ) : (
              species.map((item) => (
                <option key={item.organism_id} value={item.scientific_name}>
                  {item.scientific_name}
                </option>
              ))
            )}
          </select>
        </label>

        {selected && (
          <div className="rounded-xl border border-border bg-surface/60 p-3 text-xs text-muted sm:col-span-2">
            <p>
              Drug panel ({selected.drug_panel.length}):{" "}
              <span className="text-foreground">
                {selected.drug_panel.slice(0, 8).join(", ")}
                {selected.drug_panel.length > 8 ? "…" : ""}
              </span>
            </p>
            <p className="mt-1">
              Point mutations:{" "}
              {selected.point_mutations ? "enabled" : "acquired genes only"}
            </p>
          </div>
        )}

        <label className="block text-sm font-medium text-foreground">
          File format
          <select
            value={fileFormat}
            onChange={(event) => {
              const value = event.target.value as FileFormat;
              setFileFormat(value);
              if (value === "fasta") setReadType("assembly");
            }}
            disabled={disabled}
            className={fieldClass}
          >
            <option value="fasta">FASTA (assembly)</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-foreground">
          Read type
          <select
            value={readType}
            onChange={(event) => setReadType(event.target.value as ReadType)}
            disabled
            className={fieldClass}
          >
            <option value="assembly">Assembly</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-foreground sm:col-span-2">
          Sequence file
          <div className="mt-1.5 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-4 transition hover:border-accent/50">
            <input
              type="file"
              accept=".fasta,.fa,.fna"
              disabled={disabled}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
            />
            {file && (
              <p className="mt-3 font-mono text-xs text-muted">
                Selected:{" "}
                <span className="text-foreground">{file.name}</span> (
                {Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        </label>
      </div>

      <button
        type="button"
        disabled={
          disabled || !file || !sampleName.trim() || !organism || !toolsReady
        }
        onClick={onSubmit}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-accent to-base-t px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {disabled
          ? "Running genomic antibiogram..."
          : "Launch Multi-Pathogen Genomic AST"}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        ResFinder = primary phenotype inference · AMRFinderPlus = genotypic
        corroboration · Research use only
      </p>
    </section>
  );
}

export function buildMetadata(
  sampleName: string,
  organism: string,
  fileFormat: FileFormat,
  readType: ReadType,
): SampleMetadata {
  return {
    sample_name: sampleName.trim(),
    organism: organism.trim(),
    platform: null,
    read_type: fileFormat === "fasta" ? "assembly" : readType,
    file_format: fileFormat,
    notes: null,
  };
}
