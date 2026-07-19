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
      description: "User selects FASTA/FASTQ in the Next.js client",
      kind: "client",
    },
  },
  {
    id: "api",
    type: "pipeline",
    position: { x: COL, y: MID_Y },
    data: {
      label: "FastAPI intake",
      description: "/uploads + /analyses create the job",
      kind: "api",
    },
  },
  {
    id: "storage",
    type: "pipeline",
    position: { x: COL * 2, y: MID_Y },
    data: {
      label: "Object storage + job state",
      description: "Persist file & analysis record (queued)",
      kind: "storage",
    },
  },
  {
    id: "compute",
    type: "pipeline",
    position: { x: COL * 3, y: MID_Y },
    data: {
      label: "Modal / local compute",
      description: "Runner picks up the queued job",
      kind: "compute",
    },
  },
  {
    id: "qc",
    type: "pipeline",
    position: { x: COL * 4, y: MID_Y },
    data: {
      label: "QC",
      description: "Read/assembly quality gates & species check",
      kind: "qc",
    },
  },
  {
    id: "assembly",
    type: "pipeline",
    position: { x: COL * 5, y: MID_Y },
    data: {
      label: "Assembly",
      description: "SPAdes / Flye or pass-through assembly",
      kind: "qc",
    },
  },
  {
    id: "features",
    type: "pipeline",
    position: { x: COL * 6, y: MID_Y },
    data: {
      label: "Feature extraction",
      description: "Encode variants & model features",
      kind: "qc",
    },
  },
  {
    id: "amr",
    type: "pipeline",
    position: { x: COL * 7, y: MID_Y - 130 },
    data: {
      label: "AMR predictor + SHAP",
      description: "ML susceptibility call with attributions",
      kind: "ml",
    },
  },
  {
    id: "marker",
    type: "pipeline",
    position: { x: COL * 7, y: MID_Y + 130 },
    data: {
      label: "Marker corroboration",
      description: "QRDR / known resistance marker lookup",
      kind: "marker",
    },
  },
  {
    id: "reconcile",
    type: "pipeline",
    position: { x: COL * 8, y: MID_Y },
    data: {
      label: "Reconciliation",
      description: "Fuse ML + mechanistic evidence into a verdict",
      kind: "reconcile",
    },
  },
  {
    id: "gemini",
    type: "pipeline",
    position: { x: COL * 9, y: MID_Y },
    data: {
      label: "Gemini interpretation",
      description: "Clinical summary, drivers & alternatives",
      kind: "ai",
    },
  },
  {
    id: "result",
    type: "pipeline",
    position: { x: COL * 10, y: MID_Y },
    data: {
      label: "Persisted result + SSE",
      description: "Store result, stream progress events",
      kind: "storage",
    },
  },
  {
    id: "dashboard",
    type: "pipeline",
    position: { x: COL * 11, y: MID_Y },
    data: {
      label: "Dashboard",
      description: "Report renders in the browser",
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
  edge("qc", "assembly"),
  edge("assembly", "features"),
  edge("features", "amr"),
  edge("features", "marker"),
  edge("amr", "reconcile"),
  edge("marker", "reconcile"),
  edge("reconcile", "gemini"),
  edge("gemini", "result"),
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
