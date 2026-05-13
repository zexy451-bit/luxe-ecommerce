"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_CURRENCY } from "@/lib/currency";

interface CurrencyState {
  code: string;
  set: (code: string) => void;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      code: BASE_CURRENCY,
      set: (code) => set({ code }),
    }),
    { name: "luxe-currency" }
  )
);
