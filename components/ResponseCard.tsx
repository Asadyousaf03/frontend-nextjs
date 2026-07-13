import type { AnalyzeResponse } from "@/types/analyze";

interface ResponseCardProps {
  data: AnalyzeResponse;
}

function confidenceColor(score: number): string {
  if (score >= 0.8) return "text-emerald-400";
  if (score >= 0.5) return "text-amber-400";
  return "text-rose-400";
}

export default function ResponseCard({ data }: ResponseCardProps) {
  const confidencePercent = Math.round(data.confidence_score * 100);

  return (
    <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 shadow-xl shadow-indigo-950/20">
      <header className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          {data.status}
        </span>
        <span
          className={`text-sm font-medium ${confidenceColor(data.confidence_score)}`}
        >
          {confidencePercent}% confidence
        </span>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-400">
          Summary
        </h2>
        <p className="text-base leading-relaxed text-slate-100">{data.summary}</p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">
          Recommended Actions
        </h2>
        <ul className="space-y-2">
          {data.actions.map((action, index) => (
            <li
              key={`${action}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                {index + 1}
              </span>
              {action}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-6">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Confidence score</span>
          <span>{data.confidence_score.toFixed(2)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </footer>
    </article>
  );
}
