// Currency catalog + FX (display-only). NPR is the base.
// All amounts in the database are NPR. The customer can browse in another
// currency for display, but checkout/orders/payment always run in NPR.
//
// Rates below are approximate "1 unit of target = N NPR". Bump them when stale
// or replace with a live feed (e.g. frankfurter.app) in a server route.

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateInNpr: number; // 1 unit of this currency = rateInNpr NPR
  decimals?: number;
}

export const CURRENCIES: Currency[] = [
  { code: "NPR", symbol: "Rs.", name: "Nepalese Rupee", rateInNpr: 1 },
  { code: "USD", symbol: "$", name: "US Dollar", rateInNpr: 135 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateInNpr: 1.6 },
  { code: "EUR", symbol: "€", name: "Euro", rateInNpr: 145 },
  { code: "GBP", symbol: "£", name: "British Pound", rateInNpr: 170 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rateInNpr: 0.85, decimals: 0 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateInNpr: 87 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateInNpr: 97 },
];

export const BASE_CURRENCY = "NPR";

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function formatMoney(amountInNpr: number, currencyCode: string = BASE_CURRENCY): string {
  const c = getCurrency(currencyCode);
  const converted = (Number(amountInNpr) || 0) / c.rateInNpr;
  const decimals = c.decimals ?? 2;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);
  return `${c.symbol} ${formatted}`;
}
