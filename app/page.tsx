"use client";

import { useEffect, useRef, useState } from "react";
import HackNationHeader from "@/components/HackNationHeader";
import PipelineFlowSection from "@/components/PipelineFlowSection";
import ProgressPanel from "@/components/ProgressPanel";
import ReportDashboard from "@/components/ReportDashboard";
import UploadPanel, { buildMetadata } from "@/components/UploadPanel";
import {
  createAnalysis,
  createUpload,
  getAnalysisResult,
  getAnalysisStatus,
  getApiCapabilities,
  putUploadContent,
  streamAnalysisEvents,
} from "@/lib/api";
import type {
  AnalysisEvent,
  AnalysisResult,
  ApiCapabilities,
  FileFormat,
  ReadType,
  SpeciesCapability,
  UiState,
} from "@/types/genomic";

export default function HomePage() {
  const [sampleName, setSampleName] = useState("");
  const [organism, setOrganism] = useState("Escherichia coli");
  const [species, setSpecies] = useState<SpeciesCapability[]>([]);
  const [capabilities, setCapabilities] = useState<ApiCapabilities | null>(
    null,
  );
  const [fileFormat, setFileFormat] = useState<FileFormat>("fasta");
  const [readType, setReadType] = useState<ReadType>("assembly");
  const [file, setFile] = useState<File | null>(null);
  const [uiState, setUiState] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string | null>(null);
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getApiCapabilities(controller.signal)
      .then((caps) => {
        setCapabilities(caps);
        if (caps.species?.length) {
          setSpecies(caps.species);
          setOrganism(caps.species[0].scientific_name);
        }
      })
      .catch(() => {
        setCapabilities(null);
      });
    return () => controller.abort();
  }, []);

  async function handleLaunch() {
    if (!file || !sampleName.trim() || !organism.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setUiState("uploading");
    setError(null);
    setResult(null);
    setEvents([]);
    setProgress(0);
    setStage("upload");
    setAnalysisId(null);

    try {
      const metadata = buildMetadata(sampleName, organism, fileFormat, readType);
      const upload = await createUpload(
        file,
        metadata,
        controller.signal,
        capabilities,
      );
      await putUploadContent(upload.upload_url, file, controller.signal);

      setUiState("running");
      const created = await createAnalysis(
        upload.upload_id,
        upload.object_key,
        metadata,
        controller.signal,
        capabilities,
      );
      setAnalysisId(created.analysis_id);

      streamAnalysisEvents(
        created.analysis_id,
        (event) => {
          setEvents((prev) => {
            if (prev.some((item) => item.sequence === event.sequence)) {
              return prev;
            }
            return [...prev, event];
          });
          setProgress(event.progress);
          setStage(event.stage);
        },
        async (terminal) => {
          if (terminal === "completed") {
            const finalResult = await getAnalysisResult(created.analysis_id);
            setResult(finalResult);
            setUiState("success");
            setProgress(1);
            setStage("completed");
          } else {
            const status = await getAnalysisStatus(created.analysis_id);
            setError(status.error || "Analysis failed");
            setUiState("error");
          }
        },
        controller.signal,
      );

      const poll = window.setInterval(async () => {
        try {
          const status = await getAnalysisStatus(created.analysis_id);
          setProgress(status.progress);
          setStage(status.current_stage ?? status.status);
          if (status.status === "completed") {
            window.clearInterval(poll);
            const finalResult = await getAnalysisResult(created.analysis_id);
            setResult(finalResult);
            setUiState("success");
          } else if (status.status === "failed") {
            window.clearInterval(poll);
            setError(status.error || "Analysis failed");
            setUiState("error");
          }
        } catch {
          // Ignore transient poll errors while SSE is primary.
        }
      }, 2000);

      controller.signal.addEventListener("abort", () => {
        window.clearInterval(poll);
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(
        message.includes("Failed to fetch")
          ? "Unable to reach the genomic AST API. If this is the first request after idle time, wait ~30s for Cloud Run cold start, then retry. Confirm NEXT_PUBLIC_API_URL."
          : message,
      );
      setUiState("error");
    }
  }

  const busy = uiState === "uploading" || uiState === "running";
  const toolsReady = capabilities?.tools_ready !== false;

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-6 lg:py-12">
      <HackNationHeader />

      <div className="mb-6 rounded-xl border border-atu/30 bg-atu-soft/70 px-4 py-3 text-sm leading-relaxed text-atu">
        Multi-pathogen genomic antibiogram MVP · ResFinder inference +
        AMRFinderPlus corroboration · assembled FASTA only · research use only ·
        not for clinical decision-making
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <UploadPanel
          sampleName={sampleName}
          setSampleName={setSampleName}
          organism={organism}
          setOrganism={setOrganism}
          species={species}
          readType={readType}
          setReadType={setReadType}
          fileFormat={fileFormat}
          setFileFormat={setFileFormat}
          file={file}
          setFile={setFile}
          disabled={busy}
          onSubmit={handleLaunch}
          toolsReady={toolsReady || capabilities?.mode === "fixture"}
        />

        {(busy || events.length > 0) && (
          <ProgressPanel progress={progress} stage={stage} events={events} />
        )}
      </div>

      {analysisId && (
        <p className="mt-4 font-mono text-xs text-muted">
          analysis_id:{" "}
          <span className="text-foreground/80">{analysisId}</span>
        </p>
      )}

      {uiState === "error" && error && (
        <div className="mt-6 rounded-xl border border-res/30 bg-res-soft px-4 py-3 text-sm text-res">
          {error}
        </div>
      )}

      {uiState === "success" && result && (
        <div className="mt-8">
          <ReportDashboard result={result} />
        </div>
      )}

      <div className="mt-10">
        <PipelineFlowSection />
      </div>
    </main>
  );
}
