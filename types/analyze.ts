export interface AnalyzeResponse {
  status: string;
  summary: string;
  actions: string[];
  confidence_score: number;
}

export type RequestState = "idle" | "loading" | "success" | "error";

export interface ErrorResponse {
  error: string;
  detail?: string;
  code?: string;
}

export type LogLevel = "info" | "warn" | "error" | "success";
export type LogSessionStatus = "running" | "completed" | "failed";

export interface AgentLogEntry {
  step: number;
  message: string;
  level: LogLevel;
  timestamp: string;
}

export interface AgentLogHistory {
  session_id: string;
  status: LogSessionStatus;
  entries: AgentLogEntry[];
}

export interface StreamLogEvent {
  step: number;
  message: string;
  level: LogLevel;
}
