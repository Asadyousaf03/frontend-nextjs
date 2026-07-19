"use client";

import type { FileFormat, ReadType, SampleMetadata } from "@/types/genomic";

interface UploadPanelProps {
  sampleName: string;
  setSampleName: (value: string) => void;
  readType: ReadType;
  setReadType: (value: ReadType) => void;
  fileFormat: FileFormat;
  setFileFormat: (value: FileFormat) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  disabled: boolean;
  onSubmit: () => void;
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60";

export default function UploadPanel({
  sampleName,
  setSampleName,
  readType,
  setReadType,
  fileFormat,
  setFileFormat,
  file,
  setFile,
  disabled,
  onSubmit,
}: UploadPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface-2/80 p-6 shadow-xl shadow-black/5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Genomic sample intake
          </h2>
          <p className="mt-1 text-xs text-muted">
            Upload FASTA/FASTQ · organism locked to E. coli
          </p>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent-soft/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          Step 1
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground sm:col-span-2">
          Sample name
          <input
            value={sampleName}
            onChange={(event) => setSampleName(event.target.value)}
            disabled={disabled}
            className={fieldClass}
            placeholder="e.g. UTI isolate 2026-001"
          />
        </label>

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
            <option value="fastq">FASTQ (reads)</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-foreground">
          Read type
          <select
            value={readType}
            onChange={(event) => setReadType(event.target.value as ReadType)}
            disabled={disabled || fileFormat === "fasta"}
            className={fieldClass}
          >
            <option value="assembly">Assembly</option>
            <option value="short">Short reads (SPAdes)</option>
            <option value="long">Long reads (Flye)</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-foreground sm:col-span-2">
          Sequence file
          <div className="mt-1.5 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-4 transition hover:border-accent/50">
            <input
              type="file"
              accept=".fasta,.fa,.fna,.fastq,.fq,.gz"
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
        disabled={disabled || !file || !sampleName.trim()}
        onClick={onSubmit}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-accent to-base-t px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {disabled ? "Running genomic AST..." : "Launch Genomic AST Analysis"}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Organism fixed to Escherichia coli · Drug panel: ciprofloxacin ·
        Research use only
      </p>
    </section>
  );
}

export function buildMetadata(
  sampleName: string,
  fileFormat: FileFormat,
  readType: ReadType,
): SampleMetadata {
  return {
    sample_name: sampleName.trim(),
    organism: "Escherichia coli",
    platform: null,
    read_type: fileFormat === "fasta" ? "assembly" : readType,
    file_format: fileFormat,
    notes: null,
  };
}
