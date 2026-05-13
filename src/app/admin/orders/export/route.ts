import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const supabase = await createClient();

  let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;

  const rows = [
    ["order_number","date","customer_name","email","phone","status","payment_method","payment_status","subtotal","discount","shipping","tax","cod_fee","grand_total","city","state","country"],
    ...((data || []).map((o) => [
      o.order_number, o.created_at, o.customer_name, o.customer_email, o.customer_phone,
      o.status, o.payment_method, o.payment_status, o.subtotal, o.discount_total,
      o.shipping_total, o.tax_total, o.cod_fee, o.grand_total,
      o.shipping_city, o.shipping_state, o.shipping_country,
    ])),
  ];
  const csv = rows
    .map((r) => r.map((v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
