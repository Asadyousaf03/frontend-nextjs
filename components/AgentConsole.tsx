"use client";

import { useEffect, useRef } from "react";

interface AgentConsoleProps {
  logs: string[];
  isStreaming: boolean;
}

export default function AgentConsole({ logs, isStreaming }: AgentConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isStreaming]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-emerald-950/20">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Agent Process Log
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            isStreaming
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {isStreaming ? "Live" : "Idle"}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
      >
        <p className="mb-3 text-xs text-slate-600">
          {"// HACK_NATION_AI :: autonomous_agent.stdout"}
        </p>

        {logs.map((log, index) => (
          <div
            key={`${log}-${index}`}
            className="animate-fade-in py-0.5 text-emerald-400"
          >
            <span className="mr-2 text-slate-600">
              [{String(index + 1).padStart(2, "0")}]
            </span>
            {log}
          </div>
        ))}

        {isStreaming && (
          <div className="mt-2 flex items-center gap-2 text-emerald-500/80">
            <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            <span className="text-xs">streaming execution trace…</span>
          </div>
        )}

        {logs.length === 0 && !isStreaming && (
          <p className="italic text-slate-600">
            System idle. Submit a mission brief to initialize the agent
            orchestrator.
          </p>
        )}
      </div>
    </section>
  );
}
