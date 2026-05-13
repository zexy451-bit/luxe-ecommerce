export function PressStrip() {
  const press = ["Vogue", "Harper's Bazaar", "Elle", "GQ", "T Magazine", "WSJ"];
  return (
    <section className="border-y border-border/40 bg-muted/30">
      <div className="container-wide flex flex-col items-center gap-6 py-12 md:flex-row md:justify-between">
        <p className="text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
          As featured in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {press.map((p) => (
            <span
              key={p}
              className="heading-display text-lg font-light tracking-tight text-foreground/70 md:text-xl"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
