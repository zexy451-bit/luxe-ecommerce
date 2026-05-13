"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string | null;
  name: string;
  variantLabel?: string | null;
  price: number;
  quantity: number;
  image?: string | null;
  slug: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  add: (item: CartItem) => void;
  remove: (productId: string, variantId?: string | null) => void;
  setQty: (productId: string, qty: number, variantId?: string | null) => void;
  clear: () => void;
  applyCoupon: (code: string | null) => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      add: (item) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) => i.productId === item.productId && (i.variantId ?? null) === (item.variantId ?? null)
          );
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = {
              ...next[idx],
              quantity: Math.min(next[idx].stock, next[idx].quantity + item.quantity),
            };
            return { items: next };
          }
          return { items: [...s.items, item] };
        }),
      remove: (productId, variantId) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === productId && (i.variantId ?? null) === (variantId ?? null))
          ),
        })),
      setQty: (productId, qty, variantId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
              ? { ...i, quantity: Math.max(1, Math.min(i.stock, qty)) }
              : i
          ),
        })),
      clear: () => set({ items: [], coupon: null }),
      applyCoupon: (code) => set({ coupon: code }),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "luxe-cart" }
  )
);
