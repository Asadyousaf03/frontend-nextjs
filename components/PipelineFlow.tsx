"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  getNodesBounds,
  getViewportForBounds,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import "@xyflow/react/dist/style.css";
import {
  fromDiagram,
  initialEdges,
  initialNodes,
  isPipelineDiagram,
  toDiagram,
  type PipelineNode,
  type PipelineNodeData,
  type PipelineNodeKind,
} from "@/lib/pipeline-flow";

const KIND_STYLES: Record<
  PipelineNodeKind,
  { chip: string; dot: string; label: string }
> = {
  client: { chip: "border-base-t/40 bg-base-t/10", dot: "bg-base-t", label: "Client" },
  api: { chip: "border-accent/40 bg-accent/10", dot: "bg-accent", label: "API" },
  storage: { chip: "border-atu/40 bg-atu/10", dot: "bg-atu", label: "Storage" },
  compute: { chip: "border-base-c/40 bg-base-c/10", dot: "bg-base-c", label: "Compute" },
  qc: { chip: "border-sus/40 bg-sus/10", dot: "bg-sus", label: "Processing" },
  ml: { chip: "border-accent/40 bg-accent/10", dot: "bg-accent", label: "ML" },
  marker: { chip: "border-atu/40 bg-atu/10", dot: "bg-atu", label: "Markers" },
  reconcile: { chip: "border-base-t/40 bg-base-t/10", dot: "bg-base-t", label: "Reconcile" },
  ai: { chip: "border-base-a/40 bg-base-a/10", dot: "bg-base-a", label: "AI" },
  output: { chip: "border-sus/40 bg-sus/10", dot: "bg-sus", label: "Output" },
};

const KIND_VAR: Record<PipelineNodeKind, string> = {
  client: "rgb(var(--base-t))",
  api: "rgb(var(--accent))",
  storage: "rgb(var(--atu))",
  compute: "rgb(var(--base-c))",
  qc: "rgb(var(--sus))",
  ml: "rgb(var(--accent))",
  marker: "rgb(var(--atu))",
  reconcile: "rgb(var(--base-t))",
  ai: "rgb(var(--base-a))",
  output: "rgb(var(--sus))",
};

const handleStyle = {
  width: 8,
  height: 8,
  border: "1px solid rgb(var(--surface-2))",
  background: "rgb(var(--muted))",
};

function PipelineFlowNode({ id, data, selected }: NodeProps<PipelineNode>) {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label);
  const style = KIND_STYLES[data.kind];

  const commit = useCallback(() => {
    const next = draft.trim() || data.label;
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: next } }
          : node,
      ),
    );
    setEditing(false);
  }, [draft, data.label, id, setNodes]);

  return (
    <div
      className={`w-52 rounded-xl border bg-surface-2/95 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur transition ${
        selected ? "border-accent ring-2 ring-accent/30" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div
        className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/70 ${style.chip}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        {style.label}
      </div>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") {
              setDraft(data.label);
              setEditing(false);
            }
          }}
          className="nodrag w-full rounded-md border border-accent/40 bg-surface px-1.5 py-0.5 text-sm font-semibold text-foreground outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => {
            setDraft(data.label);
            setEditing(true);
          }}
          className="block w-full cursor-text text-left font-display text-sm font-semibold leading-tight text-foreground"
          title="Double-click to rename"
        >
          {data.label}
        </button>
      )}
      <p className="mt-1 text-[11px] leading-snug text-muted">
        {data.description}
      </p>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
}

const nodeTypes: NodeTypes = { pipeline: PipelineFlowNode };

function download(filename: string, dataUrl: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function ToolbarButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {children}
    </button>
  );
}

function PipelineFlowInner() {
  const { resolvedTheme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNode>(
    initialNodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { getNodes, fitView } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            style: { stroke: "rgb(var(--muted))", strokeWidth: 1.5 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const exportBackground = resolvedTheme === "dark" ? "#020617" : "#f8fafc";

  const captureViewport = useCallback(
    async (renderer: (node: HTMLElement, options: object) => Promise<string>) => {
      const viewport = wrapperRef.current?.querySelector<HTMLElement>(
        ".react-flow__viewport",
      );
      if (!viewport) return null;

      const currentNodes = getNodes();
      const bounds = getNodesBounds(currentNodes);
      const padding = 0.15;
      const width = Math.max(bounds.width + 160, 640);
      const height = Math.max(bounds.height + 160, 360);
      const viewportTransform = getViewportForBounds(
        bounds,
        width,
        height,
        0.4,
        2,
        padding,
      );

      return renderer(viewport, {
        backgroundColor: exportBackground,
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.zoom})`,
        },
      });
    },
    [exportBackground, getNodes],
  );

  const exportPng = useCallback(async () => {
    const dataUrl = await captureViewport((node, options) =>
      toPng(node, { ...options, pixelRatio: 2 }),
    );
    if (dataUrl) download("genomic-pipeline.png", dataUrl);
  }, [captureViewport]);

  const exportSvg = useCallback(async () => {
    const dataUrl = await captureViewport((node, options) => toSvg(node, options));
    if (dataUrl) download("genomic-pipeline.svg", dataUrl);
  }, [captureViewport]);

  const exportJson = useCallback(() => {
    const diagram = toDiagram(getNodes() as PipelineNode[], edges);
    const blob = new Blob([JSON.stringify(diagram, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    download("genomic-pipeline.json", url);
    URL.revokeObjectURL(url);
  }, [edges, getNodes]);

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const parsed = JSON.parse(await file.text());
        if (!isPipelineDiagram(parsed)) {
          window.alert("This file is not a valid pipeline diagram export.");
          return;
        }
        const restored = fromDiagram(parsed);
        setNodes(restored.nodes);
        setEdges(restored.edges);
        window.requestAnimationFrame(() =>
          fitView({ padding: 0.2, duration: 300 }),
        );
      } catch {
        window.alert("Could not parse the selected JSON file.");
      }
    },
    [fitView, setEdges, setNodes],
  );

  const resetLayout = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    window.requestAnimationFrame(() =>
      fitView({ padding: 0.2, duration: 300 }),
    );
  }, [fitView, setEdges, setNodes]);

  const minimapNodeColor = useCallback(
    (node: PipelineNode) => KIND_VAR[node.data?.kind ?? "client"],
    [],
  );

  const legend = useMemo(
    () =>
      (
        [
          "client",
          "api",
          "storage",
          "compute",
          "qc",
          "ml",
          "ai",
          "output",
        ] as PipelineNodeKind[]
      ).map((kind) => ({ kind, ...KIND_STYLES[kind] })),
    [],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ToolbarButton onClick={exportPng} title="Export diagram as PNG">
          PNG
        </ToolbarButton>
        <ToolbarButton onClick={exportSvg} title="Export diagram as SVG">
          SVG
        </ToolbarButton>
        <ToolbarButton
          onClick={exportJson}
          title="Export diagram as JSON (with node positions)"
        >
          JSON
        </ToolbarButton>
        <ToolbarButton
          onClick={() => importInputRef.current?.click()}
          title="Import a diagram from a JSON export"
        >
          Import
        </ToolbarButton>
        <ToolbarButton onClick={resetLayout} title="Reset to the default layout">
          Reset
        </ToolbarButton>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImportFile(file);
            event.target.value = "";
          }}
        />
        <span className="ml-auto text-[11px] text-muted">
          Drag nodes · double-click to rename · drag between handles to connect
        </span>
      </div>

      <div
        ref={wrapperRef}
        className="pipeline-flow h-[520px] w-full overflow-hidden rounded-2xl border border-border bg-surface/40"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          aria-label="Genomic AST pipeline data-flow diagram"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="rgb(var(--border))"
          />
          <Controls className="!border-border" />
          <MiniMap
            pannable
            zoomable
            nodeColor={minimapNodeColor}
            maskColor="rgb(var(--surface) / 0.6)"
          />
        </ReactFlow>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono uppercase tracking-wider text-muted">
        {legend.map((item) => (
          <span key={item.kind} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${item.dot}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PipelineFlow() {
  return (
    <ReactFlowProvider>
      <PipelineFlowInner />
    </ReactFlowProvider>
  );
}
