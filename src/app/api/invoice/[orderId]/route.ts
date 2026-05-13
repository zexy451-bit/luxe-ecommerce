import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

function escape(s: unknown) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]!);
}
function fmt(n: number, sym = "$") {
  return `${sym}${Number(n).toFixed(2)}`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: store }, { data: invoice }] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").eq("id", orderId).single(),
    supabase.from("store_settings").select("*").single(),
    supabase.from("invoices").select("*").eq("order_id", orderId).maybeSingle(),
  ]);

  if (!order) return new NextResponse("Order not found", { status: 404 });

  // RLS handles access — server-rendered client already enforces.

  const sym = store?.currency_symbol || "$";
  const qrPayload = `${order.order_number} | ${fmt(order.grand_total, sym)} | ${order.customer_email}`;
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 160 });

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${escape(order.order_number)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#15110d;margin:0;background:#f7f3ee}
  .sheet{max-width:820px;margin:32px auto;background:#fff;padding:56px;border-radius:18px;box-shadow:0 24px 80px -24px rgba(0,0,0,.12)}
  .brand{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #eee;padding-bottom:24px;margin-bottom:32px}
  .brand h1{font-family:Georgia,serif;font-weight:300;font-size:36px;margin:0}
  .meta{text-align:right;font-size:12px;color:#666;line-height:1.6}
  .meta strong{color:#15110d;font-size:18px;letter-spacing:.04em}
  .row{display:flex;gap:48px;margin-bottom:32px}
  .row > div{flex:1}
  .row h4{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#888;margin:0 0 8px}
  .row p{margin:0;font-size:13px;line-height:1.55}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  thead th{text-align:left;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#888;border-bottom:1px solid #eee;padding:10px 8px}
  tbody td{padding:14px 8px;border-bottom:1px solid #f1ebe2;font-size:13px}
  tbody td.right{text-align:right}
  .totals{margin-left:auto;width:300px}
  .totals .line{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#555}
  .totals .grand{font-size:18px;font-weight:600;color:#15110d;border-top:2px solid #15110d;padding-top:12px;margin-top:8px}
  .footer{margin-top:36px;border-top:1px solid #eee;padding-top:24px;display:flex;justify-content:space-between;align-items:flex-end}
  .footer .qr{text-align:right}
  .footer .qr img{width:96px;height:96px}
  .footer .qr p{font-size:10px;color:#888;margin:4px 0 0;letter-spacing:.16em;text-transform:uppercase}
  .pill{display:inline-block;border-radius:999px;padding:2px 10px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;background:#15110d;color:#fff}
  .toolbar{max-width:820px;margin:24px auto -12px;display:flex;justify-content:flex-end;gap:8px}
  .toolbar button{border:none;background:#15110d;color:#fff;padding:10px 18px;border-radius:999px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer}
  .toolbar button.outline{background:transparent;color:#15110d;border:1px solid #15110d}
  @media print{.toolbar{display:none}body{background:#fff}.sheet{box-shadow:none;border-radius:0;margin:0;max-width:none;padding:32px}}
</style>
</head>
<body>
  <div class="toolbar">
    <button class="outline" onclick="window.history.back()">Back</button>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="sheet">
    <div class="brand">
      <div>
        <h1>${escape(store?.store_name || "Luxe")}</h1>
        <p style="margin:6px 0 0;font-size:12px;color:#666;line-height:1.55">
          ${escape(store?.store_address || "")}<br/>
          ${escape(store?.store_email || "")} · ${escape(store?.store_phone || "")}
        </p>
      </div>
      <div class="meta">
        <span class="pill">Invoice</span>
        <p style="margin:10px 0 0"><strong>${escape(invoice?.invoice_number || "INV-" + order.order_number)}</strong></p>
        <p>Order ${escape(order.order_number)}</p>
        <p>${new Date(order.created_at).toLocaleDateString()}</p>
      </div>
    </div>

    <div class="row">
      <div>
        <h4>Billed to</h4>
        <p>
          <strong>${escape(order.customer_name)}</strong><br/>
          ${escape(order.customer_email)}<br/>
          ${escape(order.customer_phone)}
        </p>
      </div>
      <div>
        <h4>Shipping address</h4>
        <p>
          ${escape(order.shipping_line1)}${order.shipping_line2 ? ", " + escape(order.shipping_line2) : ""}<br/>
          ${escape(order.shipping_city)}, ${escape(order.shipping_state)} ${escape(order.shipping_postal_code)}<br/>
          ${escape(order.shipping_country)}
        </p>
      </div>
      <div>
        <h4>Payment</h4>
        <p>
          ${escape(order.payment_method.toUpperCase())}<br/>
          Status: ${escape(order.payment_status)}<br/>
          ${order.payment_reference ? "Ref: " + escape(order.payment_reference) : ""}
        </p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="right">Qty</th>
          <th class="right">Unit</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(order.order_items || []).map((it: any) => `
          <tr>
            <td>
              ${escape(it.product_name)}
              ${it.variant_label ? `<div style="color:#888;font-size:11px">${escape(it.variant_label)}</div>` : ""}
            </td>
            <td class="right">${it.quantity}</td>
            <td class="right">${fmt(it.unit_price, sym)}</td>
            <td class="right">${fmt(it.line_total, sym)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="totals">
      <div class="line"><span>Subtotal</span><span>${fmt(order.subtotal, sym)}</span></div>
      ${order.discount_total > 0 ? `<div class="line"><span>Discount${order.coupon_code ? " ("+escape(order.coupon_code)+")" : ""}</span><span>−${fmt(order.discount_total, sym)}</span></div>` : ""}
      <div class="line"><span>Shipping</span><span>${order.shipping_total === 0 ? "Free" : fmt(order.shipping_total, sym)}</span></div>
      ${order.tax_total > 0 ? `<div class="line"><span>Tax</span><span>${fmt(order.tax_total, sym)}</span></div>` : ""}
      ${order.cod_fee > 0 ? `<div class="line"><span>COD fee</span><span>${fmt(order.cod_fee, sym)}</span></div>` : ""}
      <div class="line grand"><span>Total</span><span>${fmt(order.grand_total, sym)}</span></div>
    </div>

    <div class="footer">
      <div style="font-size:11px;color:#888;max-width:60%">
        Thank you for shopping with ${escape(store?.store_name || "Luxe")}.<br/>
        Questions? Reach us at ${escape(store?.store_email || "")}.
      </div>
      <div class="qr">
        <img src="${qrDataUrl}" alt="Order QR" />
        <p>Order code</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
