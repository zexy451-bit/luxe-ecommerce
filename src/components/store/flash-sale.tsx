"use client";
import { useEffect, useState } from "react";

export function FlashSaleCountdown({ endsAt, title }: { endsAt: string; title: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - now);
  if (diff === 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return (
    <div className="container-wide my-16">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-primary p-10 text-center text-primary-foreground md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Flash sale</p>
          <h3 className="heading-display mt-2 text-3xl font-light">{title}</h3>
        </div>
        <div className="flex gap-3 font-mono text-2xl">
          {[
            { l: "Days", v: d },
            { l: "Hrs", v: h },
            { l: "Min", v: m },
            { l: "Sec", v: s },
          ].map((u) => (
            <div key={u.l} className="rounded-xl bg-white/10 px-4 py-3 text-center min-w-[64px]">
              <div className="tabular-nums">{u.v.toString().padStart(2, "0")}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/60">{u.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
