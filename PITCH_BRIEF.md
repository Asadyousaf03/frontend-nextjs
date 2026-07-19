# Pitch Brief — Hack Nation AI

## The product in one sentence

Hack Nation AI turns an assembled bacterial genome into a transparent, multi-drug genomic antibiogram: predicted resistance or susceptibility, the genetic evidence behind each call, agreement between two trusted tools, and explanations for both specialists and non-specialists.

**Research use only. It is not a clinical diagnostic and does not replace phenotypic AST.**

## The problem

Antimicrobial-resistance analysis is often split across command-line tools, technical outputs, and specialist interpretation. A raw list of resistance genes is not the same as a clear drug-by-drug answer, and missing evidence can easily be misread as susceptibility.

## What we built

1. The user selects the expected organism and uploads an assembled FASTA genome.
2. The system checks file quality and reports PASS, WARN, or FAIL.
3. **ResFinder** performs the primary genotype-to-phenotype inference.
4. **AMRFinderPlus** independently checks resistance determinants.
5. Our reconciliation layer creates a per-drug antibiogram and explicitly marks agreement, conflict, uncertainty, unsupported calls, and tool failures.
6. The dashboard shows live pipeline progress, evidence, confidence, tool/database versions, and specialist/plain-English explanations.

Current panels cover **8 organism panels**: *E. coli*, *Salmonella*, *Campylobacter jejuni/coli*, *Enterococcus faecium/faecalis*, *Staphylococcus aureus*, and *Mycobacterium tuberculosis*.

## Why it is different

- **Two complementary engines, one defensible result:** ResFinder makes the primary phenotype inference; AMRFinderPlus corroborates the underlying genotype.
- **Uncertainty is a result, not an error:** disagreement becomes “conflicting/unknown,” and a failed tool never becomes “susceptible.”
- **Evidence is traceable:** every call links back to genes or mutations, identity/coverage where available, and pinned tool/database versions.
- **Useful to two audiences:** the same evidence is explained in clinician-facing language and plain English.
- **Reproducible by design:** scientific tools and databases are pinned and are never updated during a user job.
- **AI is constrained to communication:** Gemini may summarize structured results; it does not invent the resistance calls. A deterministic explanation works when Gemini is unavailable.
- **Built as a real product:** typed Next.js/FastAPI contract, asynchronous jobs, live SSE progress with polling fallback, QC, persisted artifacts, health/readiness checks, and cloud-ready compute/storage.

## 90-second pitch

“Antimicrobial resistance is a growing threat, but genomic analysis still leaves researchers moving between command-line tools, gene lists, and difficult-to-interpret reports.

Hack Nation AI turns one assembled bacterial genome into a clear, evidence-backed multi-drug antibiogram.

The user selects the expected organism and uploads a FASTA file. We first validate the assembly. ResFinder then performs our primary genotype-to-phenotype inference, while AMRFinderPlus independently looks for resistance determinants. Our reconciliation layer compares both outputs drug by drug.

What makes us different is that we do not hide uncertainty. If the tools agree, we show that. If they conflict, if evidence is insufficient, or if a tool fails, we say so explicitly—because unknown must never be presented as susceptible.

The result is a transparent dashboard with live progress, resistance calls, supporting genes and mutations, confidence, and exact tool and database provenance. We also translate the same result for clinicians and non-specialists, while keeping the scientific call deterministic and traceable.

This is a research-use platform, not a clinical diagnostic. Our next scientific milestone is validation on independent genomes paired with phenotypic AST/MIC data. Our goal is to make genomic AMR analysis more reproducible, understandable, and safe to act on in research and surveillance.”

## Demo order

1. Select *E. coli* and upload the prepared assembled FASTA.
2. Point out the FASTA QC verdict.
3. Show live stages: QC → ResFinder → AMRFinderPlus → reconciliation → interpretation.
4. Open the antibiogram and select a resistant drug.
5. Show agreement, confidence, linked gene/mutation evidence, and tool provenance.
6. Toggle between “For clinicians” and “Plain English.”
7. End on the limitations and research-use disclaimer.

## Questions judges may ask

**Is this diagnosing a patient or choosing treatment?**  
No. It is a research and surveillance decision-support prototype. Phenotypic AST remains required before clinical decisions.

**What is the AI part?**  
Gemini converts already-structured, traceable results into audience-specific explanations. The scientific calls come from pinned bioinformatics tools and deterministic reconciliation, not from an LLM.

**Why use two tools?**  
They have different roles. ResFinder is the primary genotype-to-phenotype engine; AMRFinderPlus independently corroborates resistance determinants. Their agreement or disagreement becomes visible evidence.

**Does AMRFinderPlus validate the prediction?**  
No. It provides genotypic corroboration, not phenotypic validation. Validation requires paired genome and laboratory AST/MIC data.

**What happens when no resistance gene is found?**  
We do not automatically claim susceptibility. If no defensible phenotype exists, the result is unknown. This prevents false reassurance.

**How accurate is it?**  
We do not yet claim clinical accuracy. The required next step is independent validation by species and drug, reporting sensitivity, specificity, and very major error rates against phenotypic AST/MIC. Do not cite demo metrics as validation.

**Is this live demo using the real bioinformatics tools right now?**  
The cloud image includes pinned ResFinder and AMRFinderPlus, and real-tool execution has been verified. For short presentation FASTAs, the live demo may use reproducible fixture outputs so the antibiogram remains clear. If asked, be honest about that distinction.

**Why must the user select the organism?**  
This release does not perform taxonomic identification. Species selection chooses the correct validated tool panel. Automated taxonomic confirmation is on the roadmap.

**What inputs work today?**  
Assembled nucleotide FASTA files only. Raw FASTQ reads and assembly are intentionally out of scope for this release.

**How is it better than running ResFinder alone?**  
It adds independent corroboration, explicit conflict/failure handling, per-drug reconciliation, QC, provenance, live workflow visibility, and accessible explanations in one interface.

**Can it scale?**  
The API and compute are separated. Local/Docker execution supports development; Modal workers, Postgres, and S3 are supported for cloud execution. Real production scale still needs load testing.

**How do you keep results reproducible?**  
Tool and database versions are pinned, recorded in every result, and never changed during a job. Raw tool artifacts can also be persisted.

**Who is it for first?**  
AMR researchers, genomic-surveillance teams, and laboratory innovation teams that already have assembled bacterial genomes and need a clearer, auditable interpretation workflow.

## Say / do not say

Say: **“genotype-inferred,” “corroborated,” “research use,” “evidence-backed,” “requires phenotypic confirmation.”**

Do not say: **“clinically validated,” “chooses the right antibiotic,” “AMRFinder proves accuracy,” or “no gene means susceptible.”**
