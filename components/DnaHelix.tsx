interface DnaHelixProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { width: 72, height: 120, pairs: 8 },
  md: { width: 96, height: 160, pairs: 10 },
  lg: { width: 128, height: 210, pairs: 12 },
} as const;

const PAIR_COLORS = [
  ["rgb(var(--base-a))", "rgb(var(--base-t))"],
  ["rgb(var(--base-c))", "rgb(var(--base-g))"],
  ["rgb(var(--base-g))", "rgb(var(--base-c))"],
  ["rgb(var(--base-t))", "rgb(var(--base-a))"],
] as const;

export default function DnaHelix({
  className = "",
  size = "md",
}: DnaHelixProps) {
  const { width, height, pairs } = SIZE_MAP[size];
  const cx = width / 2;
  const amplitude = width * 0.28;
  const top = 12;
  const bottom = height - 12;
  const step = (bottom - top) / (pairs - 1);

  const leftPath: string[] = [];
  const rightPath: string[] = [];

  for (let i = 0; i < pairs; i++) {
    const y = top + i * step;
    const phase = (i / (pairs - 1)) * Math.PI * 2;
    const lx = cx - Math.sin(phase) * amplitude;
    const rx = cx + Math.sin(phase) * amplitude;
    leftPath.push(`${i === 0 ? "M" : "L"}${lx.toFixed(1)},${y.toFixed(1)}`);
    rightPath.push(`${i === 0 ? "M" : "L"}${rx.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <div
      className={`pointer-events-none select-none animate-float [perspective:800px] ${className}`}
      aria-hidden="true"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-sm [transform-style:preserve-3d] motion-safe:animate-helix-spin"
        style={{ transformOrigin: "center center" }}
      >
        <path
          d={leftPath.join(" ")}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d={rightPath.join(" ")}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        {Array.from({ length: pairs }, (_, i) => {
          const y = top + i * step;
          const phase = (i / (pairs - 1)) * Math.PI * 2;
          const lx = cx - Math.sin(phase) * amplitude;
          const rx = cx + Math.sin(phase) * amplitude;
          const [c1, c2] = PAIR_COLORS[i % PAIR_COLORS.length];
          const mid = (lx + rx) / 2;
          return (
            <g key={i}>
              <line
                x1={lx}
                y1={y}
                x2={mid}
                y2={y}
                stroke={c1}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
              <line
                x1={mid}
                y1={y}
                x2={rx}
                y2={y}
                stroke={c2}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle cx={lx} cy={y} r="3.2" fill={c1} />
              <circle cx={rx} cy={y} r="3.2" fill={c2} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
