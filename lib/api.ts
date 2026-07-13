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
