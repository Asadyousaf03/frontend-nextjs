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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">
        Genomic sample intake
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300 sm:col-span-2">
          Sample name
          <input
            value={sampleName}
            onChange={(event) => setSampleName(event.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            placeholder="e.g. UTI isolate 2026-001"
          />
        </label>

        <label className="block text-sm text-slate-300">
          File format
          <select
            value={fileFormat}
            onChange={(event) => {
              const value = event.target.value as FileFormat;
              setFileFormat(value);
              if (value === "fasta") setReadType("assembly");
            }}
            disabled={disabled}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          >
            <option value="fasta">FASTA (assembly)</option>
            <option value="fastq">FASTQ (reads)</option>
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Read type
          <select
            value={readType}
            onChange={(event) => setReadType(event.target.value as ReadType)}
            disabled={disabled || fileFormat === "fasta"}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          >
            <option value="assembly">Assembly</option>
            <option value="short">Short reads (SPAdes)</option>
            <option value="long">Long reads (Flye)</option>
          </select>
        </label>

        <label className="block text-sm text-slate-300 sm:col-span-2">
          Sequence file
          <input
            type="file"
            accept=".fasta,.fa,.fna,.fastq,.fq,.gz"
            disabled={disabled}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-500"
          />
          {file && (
            <p className="mt-2 text-xs text-slate-500">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </label>
      </div>

      <button
        type="button"
        disabled={disabled || !file || !sampleName.trim()}
        onClick={onSubmit}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {disabled ? "Running genomic AST..." : "Launch Genomic AST Analysis"}
      </button>

      <p className="mt-3 text-xs text-slate-500">
        Organism fixed to Escherichia coli · Drug panel: ciprofloxacin · Research
        use only
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
