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
  | "heuristic"
  | "amrfinderplus"
  | "resfinder"
  | "pointfinder"
  | "reconciled";
export type LogLevel = "info" | "warn" | "error" | "success";
export type CallStatus =
  | "called"
  | "unknown"
  | "unsupported"
  | "conflicting"
  | "insufficient_evidence"
  | "tool_failed";
export type EvidenceAgreement =
  | "concordant"
  | "complementary"
  | "discordant"
  | "single_source"
  | "no_resistance_evidence"
  | "not_assessed"
  | "tool_failure";
export type ToolRunStatus = "success" | "failed" | "unavailable" | "skipped";

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

export interface SpeciesCapability {
  organism_id: string;
  scientific_name: string;
  aliases: string[];
  resfinder_species: string;
  amrfinder_organism: string;
  point_mutations: boolean;
  drug_panel: string[];
  notes?: string;
}

export interface ApiCapabilities {
  schema_version: string;
  mode: "tools-required" | "fixture" | "demo" | "validated-assets-required";
  supported_file_formats: FileFormat[];
  max_upload_bytes: number;
  compute_backend: string;
  storage_backend: string;
  require_real_tools?: boolean;
  tools_ready?: boolean;
  species?: SpeciesCapability[];
  pinned?: Record<string, string>;
  notes?: string[];
  readiness?: Record<string, unknown>;
  // legacy fields
  demo_fallback_enabled?: boolean;
  model_available?: boolean;
  upstream_model_assets_downloaded?: boolean;
  amrfinder_available?: boolean;
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
  // Structured FASTA usability verdict (additive, backward compatible).
  verdict?: "PASS" | "WARN" | "FAIL" | null;
  verdict_reasons?: string[];
  header_count?: number | null;
  invalid_chars?: number | null;
  n_content?: number | null;
  min_contig_length?: number | null;
  max_contig_length?: number | null;
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

export interface InterpretationReference {
  source: string;
  version?: string | null;
  database_version?: string | null;
  database_commit?: string | null;
  evidence_ids: string[];
  url?: string | null;
  role?: string | null;
}

export interface ClinicalInterpretation {
  summary: string;
  key_drivers: string[];
  limitations: string[];
  alternative_drugs: AlternativeDrug[];
  disclaimer: string;
  // Dual-audience summaries (additive, backward compatible).
  clinician_summary?: string | null;
  layperson_summary?: string | null;
  references?: InterpretationReference[];
}

export interface OrganismSelection {
  organism_id: string;
  scientific_name: string;
  requested_name: string;
  match_status: string;
  resfinder_species: string;
  amrfinder_organism: string;
  point_mutations: boolean;
  drug_panel: string[];
  notes?: string | null;
}

export interface ResistanceEvidence {
  evidence_id: string;
  gene: string;
  mutation?: string | null;
  identity?: number | null;
  coverage?: number | null;
  source: EvidenceSource;
  associated_drugs: string[];
  drug_class?: string | null;
  subclass?: string | null;
  method?: string | null;
  contig?: string | null;
  start?: number | null;
  end?: number | null;
  strand?: string | null;
  accession?: string | null;
  associated_phenotype?: SusceptibilityLabel | null;
  notes?: string | null;
}

export interface ToolRun {
  tool: string;
  status: ToolRunStatus;
  role: string;
  version?: string | null;
  database_version?: string | null;
  database_commit?: string | null;
  command: string[];
  runtime_seconds?: number | null;
  exit_code?: number | null;
  error?: string | null;
  stderr_summary?: string | null;
  artifact_path?: string | null;
  notes?: string | null;
  disclaimer?: string | null;
}

export interface SourceAssessment {
  source: EvidenceSource;
  status: string;
  label?: SusceptibilityLabel | null;
  evidence_ids: string[];
  notes?: string | null;
}

export interface AntimicrobialCall {
  drug_id: string;
  drug: string;
  drug_class?: string | null;
  label?: SusceptibilityLabel | null;
  call_status: CallStatus;
  agreement: EvidenceAgreement;
  evidence_ids: string[];
  source_assessments: SourceAssessment[];
  confidence_category: "high" | "moderate" | "low" | "none";
  breakpoint_standard?: string | null;
  warnings: string[];
  limitations: string[];
  // Dual-audience rationale + traceable references (additive, backward compatible).
  clinician_rationale?: string | null;
  layperson_rationale?: string | null;
  references?: InterpretationReference[];
}

export interface AnalysisProvenance {
  schema_version: string;
  pipeline_version: string;
  compute_backend: string;
  image_digest?: string | null;
  tool_execution_mode: string;
  notes: string[];
}

export interface AnalysisResult {
  schema_version?: string;
  analysis_id: string;
  status: AnalysisStatus;
  sample: SampleMetadata;
  organism?: OrganismSelection;
  qc: QCReport;
  antibiogram?: AntimicrobialCall[];
  evidence?: ResistanceEvidence[];
  tool_runs?: ToolRun[];
  susceptibility?: SusceptibilityCall | null;
  variants?: VariantEvidence[];
  shap_features?: ShapFeature[];
  interpretation: ClinicalInterpretation;
  provenance?: AnalysisProvenance;
  pipeline_versions: Record<string, string>;
  completed_at: string;
}

export type UiState = "idle" | "uploading" | "running" | "success" | "error";
