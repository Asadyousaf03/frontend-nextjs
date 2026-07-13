"use client";

import { FormEvent, useState } from "react";
import HackNationHeader from "@/components/HackNationHeader";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ResponseCard from "@/components/ResponseCard";
import { analyzeQuery } from "@/lib/api";
import type { AnalyzeResponse, RequestState } from "@/types/analyze";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    setState("loading");
    setError(null);
    setResponse(null);

    try {
      const data = await analyzeQuery(trimmed);
      setResponse(data);
      setState("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(
        message.includes("Failed to fetch")
          ? "Unable to reach the analysis service. Check that the backend is running and NEXT_PUBLIC_API_URL is correct."
          : message,
      );
      setState("error");
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />

      <HackNationHeader />

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label
            htmlFor="query"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Mission brief
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe the clinical scenario for agent analysis..."
            disabled={state === "loading"}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading" || !query.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "loading"
            ? "Agent executing mission..."
            : "Launch Autonomous Analysis"}
        </button>
      </form>

      {state === "loading" && <LoadingSkeleton />}

      {state === "error" && error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {state === "success" && response && <ResponseCard data={response} />}
    </main>
  );
}
