import type { AnalyzeResponse } from "@/types/analyze";

function getAnalyzeEndpoint(): string {
  const externalApi = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (externalApi) {
    return `${externalApi}/api/analyze`;
  }
  return "/api/analyze";
}

export async function analyzeQuery(query: string): Promise<AnalyzeResponse> {
  const response = await fetch(getAnalyzeEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<AnalyzeResponse>;
}
