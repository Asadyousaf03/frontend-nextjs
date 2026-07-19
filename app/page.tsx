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
  putUploadContent,
  streamAnalysisEvents,
} from "@/lib/api";
import type {
  AnalysisEvent,
  AnalysisResult,
  FileFormat,
  ReadType,
  UiState,
} from "@/types/genomic";

export default function HomePage() {
  const [sampleName, setSampleName] = useState("");
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

  async function handleLaunch() {
    if (!file || !sampleName.trim()) return;

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
      const metadata = buildMetadata(sampleName, fileFormat, readType);
      const upload = await createUpload(file, metadata);
      await putUploadContent(upload.upload_url, file);

      setUiState("running");
      const created = await createAnalysis(
        upload.upload_id,
        upload.object_key,
        metadata,
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
          ? "Unable to reach the genomic AST API. Check NEXT_PUBLIC_API_URL and that the backend is running."
          : message,
      );
      setUiState("error");
    }
  }

  const busy = uiState === "uploading" || uiState === "running";

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-6 lg:py-12">
      <HackNationHeader />

      <div className="mb-6 rounded-xl border border-atu/30 bg-atu-soft/70 px-4 py-3 text-sm leading-relaxed text-atu">
        E. coli · ciprofloxacin genomic AST MVP · research use only · not for
        clinical decision-making
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <UploadPanel
          sampleName={sampleName}
          setSampleName={setSampleName}
          readType={readType}
          setReadType={setReadType}
          fileFormat={fileFormat}
          setFileFormat={setFileFormat}
          file={file}
          setFile={setFile}
          disabled={busy}
          onSubmit={handleLaunch}
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

      <PipelineFlowSection />
    </main>

  );
}
