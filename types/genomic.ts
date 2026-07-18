export type AnalysisStatus =
  | "queued"
  | "uploading"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type FileFormat = "fasta" | "fastq";
export type ReadType = "short" | "long" | "assembly";
export type SusceptibilityLabel = "R" | "S" | "I" | "ATU" | "unknown";
export type EvidenceSource =
  | "ml"
  | "amrfinderplus"
  | "resfinder"
  | "pointfinder"
  | "reconciled";
export type LogLevel = "info" | "warn" | "error" | "success";

export interface SampleMetadata {
  sample_name: string;
  organism: string;
  platform?: string | null;
  read_type: ReadType;
  file_format: FileFormat;
  notes?: string | null;
}

export interface UploadResponse {
  upload_id: string;
  upload_url: string;
  object_key: string;
  expires_in_seconds: number;
}

export interface CreateAnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
  created_at: string;
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: AnalysisStatus;
  current_stage?: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  error?: string | null;
}

export interface AnalysisEvent {
  sequence: number;
  analysis_id: string;
  stage: string;
  message: string;
  level: LogLevel;
  timestamp: string;
  progress: number;
}

export interface QCReport {
  passed: boolean;
  file_format: FileFormat;
  total_bases?: number | null;
  n50?: number | null;
  contig_count?: number | null;
  gc_content?: number | null;
  species_call?: string | null;
  species_confidence?: number | null;
  contamination_flag: boolean;
  notes: string[];
}

export interface VariantEvidence {
  gene: string;
  mutation?: string | null;
  identity?: number | null;
  coverage?: number | null;
  source: EvidenceSource;
  associated_phenotype?: SusceptibilityLabel | null;
  notes?: string | null;
}

export interface ShapFeature {
  feature: string;
  shap_value: number;
  direction: "resistant" | "susceptible" | "neutral";
  rank: number;
}

export interface SusceptibilityCall {
  drug: string;
  label: SusceptibilityLabel;
  probability_resistant: number;
  calibrated_probability?: number | null;
  source: EvidenceSource;
  breakpoint_standard: string;
  confidence: number;
}

export interface AlternativeDrug {
  name: string;
  class_name: string;
  rationale: string;
  caution?: string | null;
}

export interface ClinicalInterpretation {
  summary: string;
  key_drivers: string[];
  limitations: string[];
  alternative_drugs: AlternativeDrug[];
  disclaimer: string;
}

export interface AnalysisResult {
  analysis_id: string;
  status: AnalysisStatus;
  sample: SampleMetadata;
  qc: QCReport;
  susceptibility: SusceptibilityCall;
  variants: VariantEvidence[];
  shap_features: ShapFeature[];
  interpretation: ClinicalInterpretation;
  pipeline_versions: Record<string, string>;
  completed_at: string;
}

export type UiState = "idle" | "uploading" | "running" | "success" | "error";
