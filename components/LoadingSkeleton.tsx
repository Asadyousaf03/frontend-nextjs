export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="h-3 w-20 rounded-full bg-slate-700" />
        <div className="h-3 w-32 rounded-full bg-slate-700" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-slate-700" />
        <div className="h-4 w-4/6 rounded bg-slate-700" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-24 rounded bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-700" />
        <div className="h-3 w-3/4 rounded bg-slate-700" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div className="h-2 w-full rounded-full bg-slate-800">
          <div className="h-2 w-2/3 rounded-full bg-indigo-500/40" />
        </div>
        <div className="h-3 w-10 rounded bg-slate-700" />
      </div>
    </div>
  );
}
