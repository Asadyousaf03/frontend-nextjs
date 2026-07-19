# Team Brief — Hack Nation AI

## Current product

We have a working full-stack **multi-pathogen genomic antibiogram** MVP.

Input: user-selected organism + assembled bacterial FASTA.  
Output: QC, per-drug R/S/I/ATU/unknown calls, evidence agreement, genes/mutations, confidence, interpretation, and full tool provenance.

**Non-negotiable product boundary:** research use only; never present this as a clinical diagnostic or treatment recommendation.

## What works now

- 8 organism panels across *E. coli*, *Salmonella*, *Campylobacter*, *Enterococcus*, *S. aureus*, and *M. tuberculosis*
- FASTA upload and assembly QC with PASS/WARN/FAIL reasons
- ResFinder 4.7.2 as primary genotype-to-phenotype inference
- AMRFinderPlus 4.2.7 as independent genotypic corroboration
- Deterministic per-drug reconciliation
- Explicit `called`, `unknown`, `conflicting`, `tool_failed`, and `unsupported` states
- Live SSE stage updates with polling fallback
- Antibiogram, drug details, linked evidence, QC, and provenance dashboard
- Clinician and plain-English interpretations; deterministic fallback if Gemini is unavailable
- Fixture mode for reliable demos/tests and fail-closed real-tool mode
- Local/Docker execution plus Modal, Postgres, and S3 production paths
- Versioned `/api/v2` contract, health/readiness endpoints, and persisted raw artifacts

## System flow

`Next.js upload → FastAPI /api/v2 → local/S3 storage + DB → local/Modal worker → QC → ResFinder + AMRFinderPlus → reconciliation → interpretation → SSE/result dashboard`

Frontend repo: `frontend-nextjs`  
Backend repo: `backend-fastapi`

Key frontend files:

- `app/page.tsx` — upload-to-result orchestration
- `lib/api.ts` — typed API, SSE, and polling
- `components/UploadPanel.tsx` — sample/organism/file input
- `components/ProgressPanel.tsx` — live stages
- `components/ReportDashboard.tsx` — final report and evidence
- `types/genomic.ts` — frontend contract

Key backend files:

- `main.py` — app, health, readiness, capabilities
- `routes/uploads.py`, `routes/analyses.py` — v2 workflow
- `services/pipeline.py` — orchestration
- `services/qc.py` — FASTA validation
- `services/tools/` — ResFinder and AMRFinderPlus adapters
- `services/reconciliation.py` — per-drug decision rules
- `services/llm.py` — deterministic/optional Gemini explanations
- `services/species.py` — organism and drug panels
- `modal_app/` — cloud worker

## Scientific rules everyone must preserve

1. ResFinder is primary inference; AMRFinderPlus is corroboration, not validation.
2. Unknown is not susceptible.
3. Tool failure is not “no resistance found.”
4. The LLM explains structured results; it does not make the scientific call.
5. Every result must retain tool/database provenance and the research-use disclaimer.
6. The organism is user-selected; we do not yet claim taxonomic detection.
7. Only assembled FASTA is supported today.

## Demo checklist

**Live presentation state (see backend `DEMO.md`):**
- Cloud Run API has real ResFinder + AMRFinderPlus installed (`/ready`).
- Presentation currently uses **fixture execution mode** so short demo FASTAs still return a rich antibiogram.
- Real-tool runs were verified earlier; short demo assemblies alone can look sparse.
- Frontend reaches the API through the Next.js `/api/backend` proxy with a Cloud Run ID token.
- If asked, say: “tools are installed and verified; this short demo run uses reproducible fixture outputs for presentation impact.” Never claim the live short-FASTA demo is a fresh real-tool inference unless `TOOL_EXECUTION_MODE=real`.

1. Confirm `GET /ready` reports ready and note pinned versions.
2. Prefer the live Cloud Run + Vercel path for the pitch; keep local fixture as backup.
3. Use prepared *E. coli* / *S. aureus* demo FASTAs.
4. Verify upload, live stages, antibiogram, evidence, dual-audience text, and provenance.
5. Keep a completed-result screenshot/video for cold-start or network issues.
6. Presenter language must follow `PITCH_BRIEF.md`.

Local backup:

```powershell
# backend
$env:TOOL_EXECUTION_MODE="fixture"
$env:ALLOW_FIXTURE_MODE="true"
$env:REQUIRE_REAL_TOOLS="true"
uvicorn main:app --reload --port 8001

# frontend
$env:NEXT_PUBLIC_API_URL="http://localhost:8001"
npm run dev
```

## Current gaps

- No independent clinical validation against paired genome + AST/MIC datasets
- Checked-in validation metrics are not scientific proof; do not cite them as accuracy
- No automatic species/taxonomic confirmation
- No raw-read FASTQ assembly path
- No app-level auth, cancellation, retention, or load-tested scale claims
- Legacy XGBoost/SHAP code exists but is **not** on the active path
- Real-tool mode must be explicitly enabled and tested before claiming live tool inference

## Priority order

**P0 — scientific credibility**

- Run pinned real tools on independent public genome + phenotypic AST/MIC datasets.
- Report sensitivity, specificity, and error rates per species/drug.
- Record the exact test dataset and runtime versions.

**P1 — demo reliability**

- Rehearse the complete demo and cold-start recovery.
- Verify deployed `/ready`, CORS, storage, database, and Modal worker.
- Keep fixture mode and a visual fallback ready.

**P2 — next product capabilities**

- Add taxonomic confirmation.
- Add a validated raw-read assembly workflow.
- Add auth, retention controls, monitoring, and load tests.

## Team alignment

- Do not add claims to slides that are stronger than the product evidence.
- Keep frontend/backend changes contract-compatible through `/api/v2`.
- Test both successful and uncertainty/failure paths.
- Pin scientific dependencies; never update databases inside a user job.
- Put pitch changes in `PITCH_BRIEF.md` and technical status changes in this file so the whole team has one source of truth.
