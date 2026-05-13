import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warning" | "success";
  spark?: number[];
}

export function StatCard({ label, value, hint, trend, icon: Icon, tone = "default", spark }: StatCardProps) {
  const toneCls =
    tone === "warning"
      ? "bg-amber-50/70 border-amber-200"
      : tone === "success"
      ? "bg-emerald-50/70 border-emerald-200"
      : "";

  return (
    <Card className={cn("group relative overflow-hidden p-6 transition-shadow hover:shadow-lux", toneCls)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 transition-colors group-hover:bg-foreground group-hover:text-background">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <p className="mt-4 text-[1.85rem] font-semibold tracking-tight tabular-nums">
        <AnimatedNumber value={value} />
      </p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {trend !== undefined && (
            <p
              className={cn(
                "mt-0.5 text-[11px] font-medium tabular-nums",
                trend >= 0 ? "text-emerald-700" : "text-rose-700"
              )}
            >
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
            </p>
          )}
        </div>
        {spark && spark.length > 1 && <Sparkline data={spark} />}
      </div>
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 90, h = 28, pad = 1;
  const max = Math.max(1, ...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data
    .map((d, i) => {
      const x = pad + i * step;
      const y = h - pad - ((d - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-24 opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
