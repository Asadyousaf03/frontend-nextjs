import type {
  AnalysisEvent,
  AnalysisResult,
  AnalysisStatusResponse,
  CreateAnalysisResponse,
  SampleMetadata,
  UploadResponse,
} from "@/types/genomic";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { detail?: string; error?: string };
    return json.detail || json.error || text || `HTTP ${response.status}`;
  } catch {
    return text || `HTTP ${response.status}`;
  }
}

export async function createUpload(
  file: File,
  metadata: SampleMetadata,
): Promise<UploadResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      metadata,
    }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<UploadResponse>;
}

export async function putUploadContent(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const absoluteUrl = uploadUrl.startsWith("http")
    ? uploadUrl
    : `${getApiBaseUrl()}${uploadUrl}`;

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(absoluteUrl, {
    method: "PUT",
    body: form,
  });
  if (!response.ok) throw new Error(await readError(response));
}

export async function createAnalysis(
  uploadId: string,
  objectKey: string,
  metadata: SampleMetadata,
): Promise<CreateAnalysisResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      upload_id: uploadId,
      object_key: objectKey,
      metadata,
    }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<CreateAnalysisResponse>;
}

export async function getAnalysisStatus(
  analysisId: string,
): Promise<AnalysisStatusResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/analyses/${analysisId}`,
  );
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<AnalysisStatusResponse>;
}

export async function getAnalysisResult(
  analysisId: string,
): Promise<AnalysisResult> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/analyses/${analysisId}/result`,
  );
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<AnalysisResult>;
}

export function streamAnalysisEvents(
  analysisId: string,
  onEvent: (event: AnalysisEvent) => void,
  onTerminal: (status: "completed" | "failed") => void,
  signal?: AbortSignal,
): void {
  const url = `${getApiBaseUrl()}/api/v1/analyses/${analysisId}/events`;
  const source = new EventSource(url);

  const cleanup = () => source.close();
  signal?.addEventListener("abort", cleanup);

  source.addEventListener("progress", (message) => {
    const data = JSON.parse((message as MessageEvent).data) as AnalysisEvent;
    onEvent(data);
  });

  source.addEventListener("completed", () => {
    onTerminal("completed");
    cleanup();
  });

  source.addEventListener("failed", () => {
    onTerminal("failed");
    cleanup();
  });

  source.onerror = () => {
    // Browser will retry; status polling on the page covers terminal states.
  };
}
