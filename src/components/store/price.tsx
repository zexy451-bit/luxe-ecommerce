"use client";
import { useEffect, useState } from "react";
import { useCurrency } from "@/lib/currency-store";
import { formatMoney, BASE_CURRENCY } from "@/lib/currency";

export function Price({
  amount,
  className,
  bold,
}: {
  amount: number | string;
  className?: string;
  bold?: boolean;
}) {
  const code = useCurrency((s) => s.code);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Avoid hydration mismatch: render base currency until the client picks one
  const text = formatMoney(Number(amount) || 0, mounted ? code : BASE_CURRENCY);
  return <span className={className}>{text}</span>;
}
