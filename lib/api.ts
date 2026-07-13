import { parseSseChunk } from "@/lib/sse";
import type { AnalyzeResponse } from "@/types/analyze";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export async function analyzeQuery(query: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<AnalyzeResponse>;
}

export async function streamAgentLogs(
  onLog: (line: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/agent-logs`, { signal });

  if (!response.ok) {
    throw new Error(`Log stream failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error("ReadableStream not supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { events, remainder } = parseSseChunk(buffer);
    buffer = remainder;

    for (const event of events) {
      onLog(event);
    }
  }
}
