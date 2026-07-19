# Hack Nation AI — Multi-Pathogen Genomic AST Frontend

Next.js 15 dashboard for **multi-pathogen genomic antibiograms** powered by ResFinder (primary inference) and AMRFinderPlus (genotypic corroboration).

**Research use only. Not a clinical diagnostic.**

Pairs with: [backend-fastapi](https://github.com/Asadyousaf03/backend-fastapi).

## Prerequisites

- Node.js 20+
- Backend on port **8001** (or set `NEXT_PUBLIC_API_URL`)

## Setup

```powershell
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

If unset, the client defaults to `http://localhost:8001`.

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production |
| `npm run lint` | ESLint |
| `npm run sync:types` | Contract sync helper |

## Analysis flow

1. Load `GET /api/v2/capabilities` for supported organisms and tool readiness.
2. Select **expected organism** + upload assembled FASTA (`.fasta` / `.fa` / `.fna`).
3. `POST /api/v2/uploads` → `PUT` content → `POST /api/v2/analyses`.
4. Stream SSE progress (`resfinder`, `amrfinderplus`, `reconcile`, …) with poll fallback.
5. Render multi-drug antibiogram, evidence agreement, and tool provenance.

## UI

- Light/dark theme (`next-themes`)
- Organism selector from capabilities
- Antibiogram table + drug detail (R/S/I/ATU/unknown, agreement, evidence)
- Progress panel with tool stages
- Editable/exportable pipeline diagram (`PipelineFlowSection`)
- Sequence context shown only when organism/evidence warrants it (E. coli QRDR contexts are not shown for other species)

## Deploy (Vercel)

Set `NEXT_PUBLIC_API_URL` to the Render API URL. Keep CORS origins configured on the backend.

## Safety copy

Always treat outputs as research-use-only. Absence of determinants is not susceptibility. AMRFinderPlus is corroboration, not phenotypic validation.
