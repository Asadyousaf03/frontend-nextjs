# Project handoff: Multi-Pathogen Genomic AST

This file mirrors the backend handoff so either repository is a complete entry point.

See the full technical handoff in the backend repo:

[backend-fastapi/PROJECT_HANDOFF.md](https://github.com/Asadyousaf03/backend-fastapi/blob/main/PROJECT_HANDOFF.md)

## Frontend snapshot

- Organism selector from `/api/v2/capabilities`
- Assembled FASTA upload only
- SSE progress for ResFinder / AMRFinderPlus / reconcile
- Multi-drug antibiogram report with evidence agreement and tool provenance
- Editable pipeline diagram reflecting the dual-tool architecture
- Light/dark theme; research-use disclaimer always visible

## Local UI

```powershell
npm install
# .env.local → NEXT_PUBLIC_API_URL=http://localhost:8001
npm run dev
```

Run the backend in fixture or Docker mode first (see backend README).

## Research notice

Not a clinical diagnostic. Confirm with phenotypic AST before any treatment decisions.
