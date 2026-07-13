export interface AnalyzeResponse {
  status: string;
  summary: string;
  actions: string[];
  confidence_score: number;
}

export type RequestState = "idle" | "loading" | "success" | "error";
