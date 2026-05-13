"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart-store";
import { calcBreakdown } from "@/lib/pricing";
import { formatPrice, cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Address, Coupon, PaymentSettings, ShippingSettings } from "@/types/db";

interface Props {
  payment: PaymentSettings;
  shipping: ShippingSettings;
  user: { id: string; email: string } | null;
  defaultAddress: Address | null;
}

type PaymentChoice = "cod" | "qr";

const STEPS = ["Customer", "Shipping", "Payment", "Review"] as const;

export function CheckoutClient({ payment, shipping, user, defaultAddress }: Props) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotalNum = useCart((s) => s.subtotal());
  const couponCode = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const currency = useCurrency((s) => s.code);
  const fmt = (n: number) => formatMoney(n, currency);
  useEffect(() => {
    if (!couponCode) return setCoupon(null);
    const supabase = createClient();
    supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode)
      .eq("is_active", true)
      .single()
      .then(({ data }) => setCoupon(data));
  }, [couponCode]);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(defaultAddress?.full_name || "");
  const [phone, setPhone] = useState(defaultAddress?.phone || "");
  const [line1, setLine1] = useState(defaultAddress?.line1 || "");
  const [line2, setLine2] = useState(defaultAddress?.line2 || "");
  const [city, setCity] = useState(defaultAddress?.city || "");
  const [state, setState] = useState(defaultAddress?.state || "");
  const [postal, setPostal] = useState(defaultAddress?.postal_code || "");
  const [country, setCountry] = useState(defaultAddress?.country || "US");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<PaymentChoice>(
    payment.cod_enabled ? "cod" : payment.qr_enabled ? "qr" : "cod"
  );
  const [paymentRef, setPaymentRef] = useState("");

  const breakdown = useMemo(
    () => calcBreakdown(subtotalNum, coupon, payment, shipping, method),
    [subtotalNum, coupon, payment, shipping, method]
  );

  if (items.length === 0) {
    return (
      <div className="container-wide py-24 text-center">
        <h1 className="heading-display text-3xl font-light">Your cart is empty.</h1>
        <Button className="mt-6" onClick={() => router.push("/products")}>Continue shopping</Button>
      </div>
    );
  }

  const canAdvance = () => {
    if (step === 0) return email && fullName && phone.trim().length >= 6;
    if (step === 1) return line1 && city && state && postal && country;
    if (step === 2) {
      if (method === "qr") return paymentRef.length > 0;
      return true;
    }
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { email, fullName, phone, note },
          address: { line1, line2, city, state, postal, country },
          payment: { method, reference: paymentRef },
          coupon: couponCode,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Order failed");
      clear();
      router.push(`/account/orders/${json.orderId}?placed=1`);
    } catch (e) {
      toast.error((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="container-wide py-10">
      <h1 className="heading-display mb-2 text-4xl font-light">Checkout</h1>
      <ol className="mb-10 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border",
                i <= step
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={i === step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-10 lg:grid-cols-[1fr,400px]">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {step === 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="font-medium">Customer details</h2>
              <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
              <Field label="Full name"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></Field>
              <Field label="Phone"><Input type="tel" inputMode="tel" minLength={6} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" required /></Field>
              <Field label="Order note (optional)"><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            </Card>
          )}

          {step === 1 && (
            <Card className="p-6 space-y-4">
              <h2 className="font-medium">Shipping address</h2>
              <Field label="Address line 1"><Input value={line1} onChange={(e) => setLine1(e.target.value)} required /></Field>
              <Field label="Address line 2"><Input value={line2} onChange={(e) => setLine2(e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} required /></Field>
                <Field label="State"><Input value={state} onChange={(e) => setState(e.target.value)} required /></Field>
                <Field label="Postal code"><Input value={postal} onChange={(e) => setPostal(e.target.value)} required /></Field>
                <Field label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} required /></Field>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 space-y-4">
              <h2 className="font-medium">Payment method</h2>
              <div className="grid gap-3">
                {payment.cod_enabled && (
                  <PaymentOption
                    selected={method === "cod"}
                    onClick={() => setMethod("cod")}
                    title="Cash on Delivery"
                    description={`Pay when you receive your order. A ${formatPrice(payment.cod_fee)} convenience fee applies.`}
                  />
                )}
                {payment.qr_enabled && (
                  <PaymentOption
                    selected={method === "qr"}
                    onClick={() => setMethod("qr")}
                    title="QR Payment"
                    description="Scan and pay using your preferred app, then confirm with reference ID."
                  />
                )}
              </div>

              {method === "qr" && payment.qr_image_url && (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={payment.qr_image_url} alt="QR" fill className="object-contain p-2" sizes="160px" />
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">{payment.qr_instructions}</p>
                      <p className="mt-2 text-xs">Amount: <span className="font-semibold">{fmt(breakdown.grandTotal)}</span></p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Field label="Payment reference / Txn ID">
                      <Input
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="e.g. UPI ref / screenshot ID"
                        required
                      />
                    </Field>
                  </div>
                </div>
              )}
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 space-y-4">
              <h2 className="font-medium">Review your order</h2>
              <ReviewRow title="Contact">
                <div>{fullName} · {email}</div>
                <div>{phone}</div>
              </ReviewRow>
              <ReviewRow title="Shipping to">
                <div>{line1}{line2 ? `, ${line2}` : ""}</div>
                <div>{city}, {state} {postal}, {country}</div>
              </ReviewRow>
              <ReviewRow title="Payment">
                <div>{method === "cod" ? "Cash on Delivery" : "QR Payment"}</div>
                {method === "qr" && <div className="text-xs text-muted-foreground">Ref: {paymentRef}</div>}
              </ReviewRow>
              {note && (
                <ReviewRow title="Note"><p className="text-sm">{note}</p></ReviewRow>
              )}
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || submitting}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
                Continue
              </Button>
            ) : (
              <Button size="lg" variant="gold" onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place order — {fmt(breakdown.grandTotal)}
              </Button>
            )}
          </div>
        </motion.div>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          <h3 className="mb-4 heading-display text-xl">Order summary</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={`${it.productId}-${it.variantId || ""}`} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  {it.image && <Image src={it.image} alt={it.name} fill sizes="60px" className="object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{it.name}</p>
                  {it.variantLabel && <p className="text-xs text-muted-foreground">{it.variantLabel}</p>}
                  <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                </div>
                <p className="text-sm font-medium">{fmt(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <Line label="Subtotal" value={fmt(breakdown.subtotal)} />
          {breakdown.discount > 0 && (
            <Line label={`Discount${coupon ? ` (${coupon.code})` : ""}`} value={`−${fmt(breakdown.discount)}`} />
          )}
          <Line label="Shipping" value={breakdown.shipping === 0 ? "Free" : fmt(breakdown.shipping)} />
          {breakdown.tax > 0 && <Line label="Tax" value={fmt(breakdown.tax)} />}
          {breakdown.codFee > 0 && <Line label="COD fee" value={fmt(breakdown.codFee)} />}
          <Separator className="my-3" />
          <Line label="Total" value={fmt(breakdown.grandTotal)} bold />
          {currency !== "NPR" && (
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              Charged in NPR · {formatPrice(breakdown.grandTotal)}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function PaymentOption({
  selected, onClick, title, description,
}: { selected: boolean; onClick: () => void; title: string; description: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected ? "border-foreground bg-muted/30" : "hover:bg-muted/40"
      )}
    >
      <span className={cn(
        "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-foreground" : "border-muted-foreground/40"
      )}>
        {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
      </span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </button>
  );
}
function ReviewRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <div className="w-28 text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}
function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between text-sm", bold && "font-semibold text-base")}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
