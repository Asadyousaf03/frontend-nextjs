# Hack Nation AI — Genomic AST Frontend

Next.js 15 dashboard for E. coli ciprofloxacin genomic antimicrobial susceptibility (AST) reports.

**Research use only. Not a clinical diagnostic.**

Pairs with the FastAPI backend: [backend-fastapi](https://github.com/Asadyousaf03/backend-fastapi).

## Prerequisites

- Node.js 20+
- Backend running locally (default port **8001**) or a deployed API URL

## Setup

```powershell
npm install
```

Create `.env.local` (gitignored):

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

If unset, the client falls back to `http://localhost:8000` — set the env var so it matches your uvicorn port.

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run sync:types` | Sync shared types via `scripts/sync-types.mjs` (if present) |

## Analysis flow

1. **Upload** — user enters sample name, format (`fasta`/`fastq`), read type, and file (`UploadPanel`).
2. **API** — `POST /api/v1/uploads` → `PUT` file content → `POST /api/v1/analyses` (`lib/api.ts`).
3. **Progress** — SSE on `/api/v1/analyses/{id}/events` plus a 2s status poll safety net (`app/page.tsx`).
4. **Report** — on completion, `GET .../result` feeds `ReportDashboard` (R/S call, QC, markers, SHAP, alternatives, sequence context).

AbortController cleans up SSE/polling on unmount or relaunch.

## UI / theme

- **Theme**: `next-themes` via `ThemeProvider` + `ThemeToggle` (light/dark, `class` strategy, `suppressHydrationWarning` on `<html>`).
- **Tokens**: semantic colors in `app/globals.css` and `tailwind.config.ts` (`foreground`, `muted`, `res`/`sus`/`atu`, soft variants). Prefer tokens over hard-coded hex in components.
- **Fonts**: Inter (sans), Space Grotesk (display), JetBrains Mono (mono) — CSS variables on the root layout.
- **Visuals**: `DnaHelix` decorative motif; `SequenceViewer` + `lib/qrdr.ts` for QRDR / sequence context in the report.
- **Chrome**: `HackNationHeader`, restyled `UploadPanel` / `ProgressPanel` / `ReportDashboard`.

There is **no** `@xyflow/react` data-flow diagram in this tree yet. If you add one, keep it behind a working interactive path (or omit broken partials).

## Key files

```
app/page.tsx              Orchestrates upload → SSE → report
lib/api.ts                Typed API client + EventSource helper
types/genomic.ts          Frontend contracts mirroring backend schemas
components/               UI panels, theme, helix, sequence viewer
```

## Demo data

Use backend samples after the API is up:

- `backend-fastapi/data/samples/demo_ecoli_cipro_r.fasta`
- `backend-fastapi/data/samples/demo_ecoli_cipro_s.fasta`

## Deploy (Vercel)

Set:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

Ensure the backend `CORS_ORIGINS` / `CORS_ORIGIN_REGEX` allow your Vercel host.
