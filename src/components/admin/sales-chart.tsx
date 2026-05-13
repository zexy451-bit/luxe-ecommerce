"use client";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";

export function SalesChart({ data }: { data: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const { points, max, w, h, pad } = useMemo(() => {
    const w = 820, h = 240, pad = { l: 50, r: 12, t: 16, b: 28 };
    const max = Math.max(1, ...data.map((d) => d.value));
    const step = (w - pad.l - pad.r) / Math.max(1, data.length - 1);
    const points = data.map((d, i) => {
      const x = pad.l + i * step;
      const y = h - pad.b - ((d.value / max) * (h - pad.t - pad.b));
      return { x, y, ...d };
    });
    return { points, max, w, h, pad: pad as { l: number; r: number; t: number; b: number } };
  }, [data]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length
    ? `M ${points[0].x} ${h - pad.b} ` +
      points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${points[points.length - 1].x} ${h - pad.b} Z`
    : "";

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (max / yTicks) * i);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid + y labels */}
        {ticks.map((t, i) => {
          const y = h - pad.b - (i / yTicks) * (h - pad.t - pad.b);
          return (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" />
              <text x={pad.l - 8} y={y + 3} fontSize="9" textAnchor="end" className="fill-muted-foreground tabular-nums">
                {t >= 1000 ? `${(t / 1000).toFixed(t >= 10000 ? 0 : 1)}k` : Math.round(t)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#g)" className="text-foreground" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.6" className="text-foreground" />

        {/* x labels (every 5th day) */}
        {points.map((p, i) =>
          i % 5 === 0 || i === points.length - 1 ? (
            <text
              key={i}
              x={p.x}
              y={h - 8}
              fontSize="9"
              textAnchor="middle"
              className="fill-muted-foreground"
            >
              {p.label}
            </text>
          ) : null
        )}

        {/* invisible hit area per day */}
        {points.map((p, i) => (
          <rect
            key={`r-${i}`}
            x={p.x - 12}
            y={pad.t}
            width="24"
            height={h - pad.t - pad.b}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {/* hover dot + vertical guide */}
        {hover !== null && points[hover] && (
          <>
            <line
              x1={points[hover].x}
              x2={points[hover].x}
              y1={pad.t}
              y2={h - pad.b}
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeOpacity="0.3"
            />
            <circle cx={points[hover].x} cy={points[hover].y} r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          </>
        )}
      </svg>

      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border bg-card px-3 py-2 text-xs shadow-lux"
          style={{
            left: `${(points[hover].x / w) * 100}%`,
            top: `${(points[hover].y / h) * 100}%`,
            transform: `translate(-50%, calc(-100% - 12px))`,
          }}
        >
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{points[hover].label}</div>
          <div className="font-semibold tabular-nums">{formatPrice(points[hover].value)}</div>
        </div>
      )}
    </div>
  );
}
