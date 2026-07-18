# Hack Nation AI — Genomic AST Frontend

Next.js dashboard for uploading FASTA/FASTQ files and viewing E. coli ciprofloxacin genomic AST reports.

## Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

```bash
npm run dev
```

## Flow

1. Enter sample name and choose FASTA/FASTQ
2. Upload sequence file
3. Watch live pipeline progress (SSE + polling safety net)
4. Review color-coded report: R/S call, QC, markers, SHAP bars, alternative drugs

## Deploy (Vercel)

Set:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```
