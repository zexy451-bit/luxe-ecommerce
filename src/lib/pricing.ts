import type { Coupon, PaymentSettings, ShippingSettings } from "@/types/db";

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  codFee: number;
  grandTotal: number;
}

export function calcDiscount(
  subtotal: number,
  coupon: Coupon | null
): number {
  if (!coupon || !coupon.is_active) return 0;
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) return 0;
  let d = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.max_discount) d = Math.min(d, coupon.max_discount);
  return Math.min(d, subtotal);
}

export function calcShipping(
  subtotalAfterDiscount: number,
  settings: Pick<ShippingSettings, "flat_rate" | "free_shipping_threshold">
): number {
  if (subtotalAfterDiscount >= settings.free_shipping_threshold) return 0;
  return settings.flat_rate;
}

export function calcTax(
  taxable: number,
  settings: Pick<ShippingSettings, "tax_rate">
): number {
  return +(taxable * settings.tax_rate).toFixed(2);
}

export function calcBreakdown(
  subtotal: number,
  coupon: Coupon | null,
  payment: Pick<PaymentSettings, "cod_fee">,
  shipping: ShippingSettings,
  method: "cod" | "qr" | "card" | "other"
): PriceBreakdown {
  const discount = calcDiscount(subtotal, coupon);
  const afterDiscount = Math.max(0, subtotal - discount);
  const ship = calcShipping(afterDiscount, shipping);
  const tax = calcTax(afterDiscount + ship, shipping);
  const codFee = method === "cod" ? payment.cod_fee : 0;
  const grandTotal = +(afterDiscount + ship + tax + codFee).toFixed(2);
  return { subtotal, discount, shipping: ship, tax, codFee, grandTotal };
}
