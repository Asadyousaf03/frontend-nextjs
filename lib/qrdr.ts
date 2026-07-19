import type { VariantEvidence } from "@/types/genomic";

export type Nucleotide = "A" | "T" | "C" | "G";

export interface QrdrContext {
  gene: string;
  mutation: string;
  label: string;
  /** Codon-centered reference context window (uppercase DNA). */
  sequence: string;
  /** 0-based index of the mutated base within `sequence`. */
  highlightIndex: number;
  codonStart: number;
  aaPosition: number;
  referenceAa: string;
  mutantAa: string;
  note: string;
}

/**
 * Curated QRDR / plasmid qnr reference contexts for ciprofloxacin markers.
 * Labeled as reference context until the backend ships real nucleotide windows.
 */
const QRDR_CONTEXTS: Record<string, QrdrContext> = {
  "gyra|s83l": {
    gene: "gyrA",
    mutation: "S83L",
    label: "gyrA QRDR · codon 83",
    sequence: "GACGGCCTGCGCCATACCGAC",
    highlightIndex: 9,
    codonStart: 9,
    aaPosition: 83,
    referenceAa: "S",
    mutantAa: "L",
    note: "Reference context · Ser→Leu at QRDR position 83",
  },
  "gyra|d87n": {
    gene: "gyrA",
    mutation: "D87N",
    label: "gyrA QRDR · codon 87",
    sequence: "CGCCATACCGACGATATGCTG",
    highlightIndex: 9,
    codonStart: 9,
    aaPosition: 87,
    referenceAa: "D",
    mutantAa: "N",
    note: "Reference context · Asp→Asn at QRDR position 87",
  },
  "gyra|d87y": {
    gene: "gyrA",
    mutation: "D87Y",
    label: "gyrA QRDR · codon 87",
    sequence: "CGCCATACCGACGATATGCTG",
    highlightIndex: 9,
    codonStart: 9,
    aaPosition: 87,
    referenceAa: "D",
    mutantAa: "Y",
    note: "Reference context · Asp→Tyr at QRDR position 87",
  },
  "parc|s80i": {
    gene: "parC",
    mutation: "S80I",
    label: "parC QRDR · codon 80",
    sequence: "AAACCGTCCAGCGCCACTGCG",
    highlightIndex: 9,
    codonStart: 9,
    aaPosition: 80,
    referenceAa: "S",
    mutantAa: "I",
    note: "Reference context · Ser→Ile at QRDR position 80",
  },
  "parc|e84k": {
    gene: "parC",
    mutation: "E84K",
    label: "parC QRDR · codon 84",
    sequence: "AGCGCCACTGCGGAACTGGGC",
    highlightIndex: 9,
    codonStart: 9,
    aaPosition: 84,
    referenceAa: "E",
    mutantAa: "K",
    note: "Reference context · Glu→Lys at QRDR position 84",
  },
  "qnr|presence": {
    gene: "qnr",
    mutation: "presence",
    label: "qnr plasmid motif",
    sequence: "ATGAGCGACCTGCAGGGCGTG",
    highlightIndex: 0,
    codonStart: 0,
    aaPosition: 1,
    referenceAa: "M",
    mutantAa: "M",
    note: "Reference context · qnr-family start motif (presence call)",
  },
};

function normalizeKey(gene: string, mutation?: string | null): string {
  const g = gene.trim().toLowerCase();
  const m = (mutation ?? "presence").trim().toLowerCase();
  if (g.startsWith("qnr")) return "qnr|presence";
  return `${g}|${m}`;
}

export function resolveQrdrContext(
  variant: VariantEvidence,
): QrdrContext | null {
  const key = normalizeKey(variant.gene, variant.mutation);
  if (QRDR_CONTEXTS[key]) return QRDR_CONTEXTS[key];

  const gene = variant.gene.trim().toLowerCase();
  if (gene === "gyra" && !variant.mutation) return QRDR_CONTEXTS["gyra|s83l"];
  if (gene === "parc" && !variant.mutation) return QRDR_CONTEXTS["parc|s80i"];
  if (gene.startsWith("qnr")) return QRDR_CONTEXTS["qnr|presence"];
  return null;
}

export function isNucleotide(char: string): char is Nucleotide {
  return char === "A" || char === "T" || char === "C" || char === "G";
}
