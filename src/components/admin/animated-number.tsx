"use client";
import { useEffect, useState } from "react";

// Animates the numeric portion of a value string like "Rs. 1,234.56" or "12".
export function AnimatedNumber({ value }: { value: string }) {
  const match = value.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return <span>{value}</span>;
  const [, prefix, numStr, suffix] = match;
  const target = parseFloat(numStr.replace(/,/g, "")) || 0;
  const decimals = (numStr.split(".")[1] || "").length;
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 700;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const display = n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
