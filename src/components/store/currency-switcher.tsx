"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CurrencySwitcher() {
  const { code, set } = useCurrency();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const display = mounted ? code : "NPR";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-widest hover:bg-muted sm:inline-flex">
        {display}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => set(c.code)}
            className={display === c.code ? "font-semibold" : ""}
          >
            <span className="w-12 font-mono text-xs text-muted-foreground">{c.code}</span>
            <span className="flex-1">{c.name}</span>
            <span className="text-muted-foreground">{c.symbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
