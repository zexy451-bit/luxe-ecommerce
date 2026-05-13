"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-store";
import { createClient } from "@/lib/supabase/client";
import { calcBreakdown } from "@/lib/pricing";
import type { Coupon, PaymentSettings, ShippingSettings } from "@/types/db";
import { toast } from "sonner";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const couponCode = useCart((s) => s.coupon);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const subtotal = useCart((s) => s.subtotal());
  const [mounted, setMounted] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState(couponCode || "");
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);
  const currency = useCurrency((s) => s.code);
  const fmt = (n: number) => formatMoney(n, currency);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("payment_settings").select("*").single(),
      supabase.from("shipping_settings").select("*").single(),
    ]).then(([p, s]) => {
      setPayment(p.data);
      setShipping(s.data);
    });
    if (couponCode) {
      supabase.from("coupons").select("*").eq("code", couponCode).eq("is_active", true).single()
        .then(({ data }) => setCoupon(data));
    }
  }, [couponCode]);

  const tryCoupon = async () => {
    if (!code.trim()) {
      applyCoupon(null);
      setCoupon(null);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();
    if (!data) {
      toast.error("Invalid coupon");
      return;
    }
    if (data.min_order_amount && subtotal < data.min_order_amount) {
      toast.error(`Minimum order ${fmt(data.min_order_amount)} required`);
      return;
    }
    setCoupon(data);
    applyCoupon(data.code);
    toast.success("Coupon applied");
  };

  if (!mounted) return null;

  const breakdown = payment && shipping
    ? calcBreakdown(subtotal, coupon, payment, shipping, "qr")
    : { subtotal, discount: 0, shipping: 0, tax: 0, codFee: 0, grandTotal: subtotal };

  if (items.length === 0) {
    return (
      <div className="container-wide py-24 text-center">
        <h1 className="heading-display text-4xl font-light">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Begin a new discovery.</p>
        <Button asChild className="mt-8">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <h1 className="heading-display mb-10 text-4xl font-light">Your cart</h1>
      <div className="grid gap-12 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          {items.map((it) => (
            <div key={`${it.productId}-${it.variantId || ""}`} className="flex gap-5 border-b pb-6">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" sizes="100px" />}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${it.slug}`} className="font-medium hover:underline">
                      {it.name}
                    </Link>
                    {it.variantLabel && (
                      <p className="text-xs text-muted-foreground">{it.variantLabel}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(it.productId, it.variantId)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border">
                    <button
                      onClick={() => setQty(it.productId, it.quantity - 1, it.variantId)}
                      className="px-3 py-1.5 hover:bg-muted rounded-l-full"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[28px] text-center text-sm">{it.quantity}</span>
                    <button
                      onClick={() => setQty(it.productId, it.quantity + 1, it.variantId)}
                      className="px-3 py-1.5 hover:bg-muted rounded-r-full"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-semibold">{fmt(it.price * it.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          <h3 className="mb-5 heading-display text-xl">Summary</h3>

          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={tryCoupon} variant="outline">Apply</Button>
          </div>

          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={fmt(breakdown.subtotal)} />
            {breakdown.discount > 0 && (
              <Row label={`Discount${coupon ? ` (${coupon.code})` : ""}`} value={`−${fmt(breakdown.discount)}`} />
            )}
            <Row label="Shipping" value={breakdown.shipping === 0 ? "Free" : fmt(breakdown.shipping)} />
            {breakdown.tax > 0 && <Row label="Tax" value={fmt(breakdown.tax)} />}
          </div>
          <Separator className="my-4" />
          <Row label="Total" value={fmt(breakdown.grandTotal)} bold />
          {currency !== "NPR" && (
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              Charged in NPR · {formatPrice(breakdown.grandTotal)}
            </p>
          )}

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Checkout</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Shipping and taxes calculated at checkout.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
