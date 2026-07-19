import type {
  ApiCapabilities,
  AnalysisEvent,
  AnalysisResult,
  AnalysisStatusResponse,
  AntimicrobialCall,
  CreateAnalysisResponse,
  SampleMetadata,
  UploadResponse,
} from "@/types/genomic";

export function getApiBaseUrl(): string {
  // Browser calls same-origin Next.js proxy which attaches Cloud Run auth.
  // Server-side / scripts can still override with NEXT_PUBLIC_API_URL.
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL ?? "/api/backend").replace(
      /\/+$/,
      "",
    );
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.CLOUD_RUN_URL ??
    "https://genomic-ast-api-67343763423.us-central1.run.app"
  ).replace(/\/+$/, "");
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { detail?: unknown; error?: unknown };
    const detail = json.detail ?? json.error;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }
          return JSON.stringify(item);
        })
        .join("; ");
    }
    return text || `HTTP ${response.status}`;
  } catch {
    return text || `HTTP ${response.status}`;
  }
}

function apiPrefix(capabilities?: ApiCapabilities | null): "/api/v2" | "/api/v1" {
  if (capabilities?.schema_version === "2" || capabilities?.species?.length) {
    return "/api/v2";
  }
  return "/api/v1";
}

export async function createUpload(
  file: File,
  metadata: SampleMetadata,
  signal?: AbortSignal,
  capabilities?: ApiCapabilities | null,
): Promise<UploadResponse> {
  const response = await fetch(`${getApiBaseUrl()}${apiPrefix(capabilities)}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      metadata,
    }),
    signal,
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<UploadResponse>;
}

export async function putUploadContent(
  uploadUrl: string,
  file: File,
  signal?: AbortSignal,
): Promise<void> {
  const absoluteUrl = uploadUrl.startsWith("http")
    ? uploadUrl
    : `${getApiBaseUrl()}${uploadUrl}`;

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(absoluteUrl, {
    method: "PUT",
    body: form,
    signal,
  });
  if (!response.ok) throw new Error(await readError(response));
}

export async function createAnalysis(
  uploadId: string,
  objectKey: string,
  metadata: SampleMetadata,
  signal?: AbortSignal,
  capabilities?: ApiCapabilities | null,
): Promise<CreateAnalysisResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${apiPrefix(capabilities)}/analyses`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_id: uploadId,
        object_key: objectKey,
        metadata,
      }),
      signal,
    },
  );
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<CreateAnalysisResponse>;
}

export async function getAnalysisStatus(
  analysisId: string,
  signal?: AbortSignal,
): Promise<AnalysisStatusResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v2/analyses/${analysisId}`,
    { signal },
  );
  if (!response.ok) {
    const fallback = await fetch(
      `${getApiBaseUrl()}/api/v1/analyses/${analysisId}`,
      { signal },
    );
    if (!fallback.ok) throw new Error(await readError(fallback));
    return fallback.json() as Promise<AnalysisStatusResponse>;
  }
  return response.json() as Promise<AnalysisStatusResponse>;
}

export function normalizeAnalysisResult(raw: AnalysisResult): AnalysisResult {
  if (raw.schema_version === "2" && raw.antibiogram) {
    return raw;
  }
  // Legacy v1 -> synthetic antibiogram
  if (raw.susceptibility) {
    const call: AntimicrobialCall = {
      drug_id: raw.susceptibility.drug.toLowerCase().replace(/\s+/g, "_"),
      drug: raw.susceptibility.drug,
      drug_class: null,
      label: raw.susceptibility.label,
      call_status: "called",
      agreement: "single_source",
      evidence_ids: [],
      source_assessments: [],
      confidence_category:
        raw.susceptibility.confidence >= 0.75
          ? "high"
          : raw.susceptibility.confidence >= 0.5
            ? "moderate"
            : "low",
      breakpoint_standard: raw.susceptibility.breakpoint_standard,
      warnings: ["Legacy v1 result adapted for antibiogram view."],
      limitations: raw.interpretation.limitations,
    };
    return {
      ...raw,
      schema_version: "1",
      antibiogram: [call],
      evidence: (raw.variants ?? []).map((variant, index) => ({
        evidence_id: `legacy-${index}`,
        gene: variant.gene,
        mutation: variant.mutation,
        identity: variant.identity,
        coverage: variant.coverage,
        source: variant.source,
        associated_drugs: [raw.susceptibility!.drug],
        associated_phenotype: variant.associated_phenotype,
        notes: variant.notes,
      })),
      tool_runs: [],
    };
  }
  return raw;
}

export async function getAnalysisResult(
  analysisId: string,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v2/analyses/${analysisId}/result`,
    { signal },
  );
  if (!response.ok) {
    const fallback = await fetch(
      `${getApiBaseUrl()}/api/v1/analyses/${analysisId}/result`,
      { signal },
    );
    if (!fallback.ok) throw new Error(await readError(fallback));
    return normalizeAnalysisResult(
      (await fallback.json()) as AnalysisResult,
    );
  }
  return normalizeAnalysisResult((await response.json()) as AnalysisResult);
}

export async function getApiCapabilities(
  signal?: AbortSignal,
): Promise<ApiCapabilities> {
  const response = await fetch(`${getApiBaseUrl()}/api/v2/capabilities`, {
    signal,
  });
  if (!response.ok) {
    const fallback = await fetch(`${getApiBaseUrl()}/api/v1/capabilities`, {
      signal,
    });
    if (!fallback.ok) throw new Error(await readError(fallback));
    return fallback.json() as Promise<ApiCapabilities>;
  }
  return response.json() as Promise<ApiCapabilities>;
}

export function streamAnalysisEvents(
  analysisId: string,
  onEvent: (event: AnalysisEvent) => void,
  onTerminal: (status: "completed" | "failed") => void,
  signal?: AbortSignal,
): void {
  const url = `${getApiBaseUrl()}/api/v2/analyses/${analysisId}/events`;
  const source = new EventSource(url);

  const cleanup = () => source.close();
  signal?.addEventListener("abort", cleanup);

  source.addEventListener("progress", (message) => {
    try {
      const data = JSON.parse((message as MessageEvent).data) as AnalysisEvent;
      onEvent(data);
    } catch {
      // Polling remains the source of truth if an event payload is malformed.
    }
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
