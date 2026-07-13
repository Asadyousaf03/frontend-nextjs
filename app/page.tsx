"use client";

import { FormEvent, useState } from "react";
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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          AI Agent Console
        </h1>
        <p className="mt-3 text-slate-400">
          Submit a query to receive a mock agent analysis response.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label
            htmlFor="query"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Analysis query
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a patient case or clinical question..."
            disabled={state === "loading"}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading" || !query.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "loading" ? "Analyzing..." : "Run Analysis"}
        </button>
      </form>

      {state === "loading" && <LoadingSkeleton />}

      {state === "error" && error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {state === "success" && response && <ResponseCard data={response} />}
    </main>
  );
}
