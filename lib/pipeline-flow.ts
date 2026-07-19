import { MarkerType, type Edge, type Node } from "@xyflow/react";

export type PipelineNodeKind =
  | "client"
  | "api"
  | "storage"
  | "compute"
  | "qc"
  | "ml"
  | "marker"
  | "reconcile"
  | "ai"
  | "output";

export interface PipelineNodeData {
  label: string;
  description: string;
  kind: PipelineNodeKind;
  [key: string]: unknown;
}

export type PipelineNode = Node<PipelineNodeData, "pipeline">;

export interface PipelineDiagram {
  version: 1;
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: PipelineNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }>;
}

const COL = 260;
const MID_Y = 170;

export const initialNodes: PipelineNode[] = [
  {
    id: "upload",
    type: "pipeline",
    position: { x: 0, y: MID_Y },
    data: {
      label: "Browser upload",
      description: "Assembled FASTA + expected organism",
      kind: "client",
    },
  },
  {
    id: "api",
    type: "pipeline",
    position: { x: COL, y: MID_Y },
    data: {
      label: "FastAPI intake",
      description: "/api/v2 uploads + analyses",
      kind: "api",
    },
  },
  {
    id: "storage",
    type: "pipeline",
    position: { x: COL * 2, y: MID_Y },
    data: {
      label: "Object storage + job state",
      description: "Persist file & analysis record",
      kind: "storage",
    },
  },
  {
    id: "compute",
    type: "pipeline",
    position: { x: COL * 3, y: MID_Y },
    data: {
      label: "Modal / Docker compute",
      description: "Pinned Linux tool runtime",
      kind: "compute",
    },
  },
  {
    id: "qc",
    type: "pipeline",
    position: { x: COL * 4, y: MID_Y },
    data: {
      label: "Assembly QC",
      description: "FASTA gates (no taxonomy claim)",
      kind: "qc",
    },
  },
  {
    id: "species",
    type: "pipeline",
    position: { x: COL * 5, y: MID_Y },
    data: {
      label: "Organism panel",
      description: "User-selected ResFinder species panel",
      kind: "qc",
    },
  },
  {
    id: "resfinder",
    type: "pipeline",
    position: { x: COL * 6, y: MID_Y - 130 },
    data: {
      label: "ResFinder",
      description: "Primary genotype→phenotype antibiogram",
      kind: "ml",
    },
  },
  {
    id: "amrfinder",
    type: "pipeline",
    position: { x: COL * 6, y: MID_Y + 130 },
    data: {
      label: "AMRFinderPlus",
      description: "Independent genotypic corroboration",
      kind: "marker",
    },
  },
  {
    id: "reconcile",
    type: "pipeline",
    position: { x: COL * 7, y: MID_Y },
    data: {
      label: "Per-drug reconciliation",
      description: "Agreement / conflict / unknown states",
      kind: "reconcile",
    },
  },
  {
    id: "interpret",
    type: "pipeline",
    position: { x: COL * 8, y: MID_Y },
    data: {
      label: "Interpretation",
      description: "Research-use summary from structured calls",
      kind: "ai",
    },
  },
  {
    id: "result",
    type: "pipeline",
    position: { x: COL * 9, y: MID_Y },
    data: {
      label: "Persisted result + SSE",
      description: "Versioned antibiogram + tool provenance",
      kind: "storage",
    },
  },
  {
    id: "dashboard",
    type: "pipeline",
    position: { x: COL * 10, y: MID_Y },
    data: {
      label: "Dashboard",
      description: "Multi-drug antibiogram report",
      kind: "output",
    },
  },
];

function edge(source: string, target: string, label?: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    label,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { stroke: "rgb(var(--muted))", strokeWidth: 1.5 },
    labelStyle: { fill: "rgb(var(--muted))", fontSize: 10 },
    labelBgStyle: { fill: "rgb(var(--surface-2))" },
  };
}

export const initialEdges: Edge[] = [
  edge("upload", "api", "upload"),
  edge("api", "storage", "persist"),
  edge("storage", "compute", "dequeue"),
  edge("compute", "qc"),
  edge("qc", "species"),
  edge("species", "resfinder"),
  edge("species", "amrfinder"),
  edge("resfinder", "reconcile"),
  edge("amrfinder", "reconcile"),
  edge("reconcile", "interpret"),
  edge("interpret", "result"),
  edge("result", "dashboard", "SSE"),
];

export function toDiagram(nodes: PipelineNode[], edges: Edge[]): PipelineDiagram {
  return {
    version: 1,
    nodes: nodes.map((node) => ({
      id: node.id,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === "string" ? e.label : undefined,
    })),
  };
}

export function fromDiagram(diagram: PipelineDiagram): {
  nodes: PipelineNode[];
  edges: Edge[];
} {
  const nodes: PipelineNode[] = diagram.nodes.map((node) => ({
    id: node.id,
    type: "pipeline",
    position: node.position,
    data: node.data,
  }));
  const edges: Edge[] = diagram.edges.map((e) =>
    edge(e.source, e.target, e.label),
  );
  return { nodes, edges };
}

export function isPipelineDiagram(value: unknown): value is PipelineDiagram {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PipelineDiagram>;
  return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}
