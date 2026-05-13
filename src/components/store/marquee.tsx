export function Marquee({
  items,
  speed = 40,
}: {
  items: string[];
  speed?: number;
}) {
  const loop = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border/40 bg-background py-7">
      <div
        className="flex w-max gap-12 animate-marquee whitespace-nowrap"
        style={{ animationDuration: `${speed}s` }}
      >
        {loop.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-12 text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          >
            <span>{item}</span>
            <span className="text-foreground">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
