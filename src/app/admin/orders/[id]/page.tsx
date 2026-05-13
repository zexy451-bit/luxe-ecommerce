import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { OrderNoteEditor } from "@/components/admin/order-note-editor";
import { Download, ArrowLeft } from "lucide-react";
import type { OrderItem } from "@/types/db";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="heading-display text-3xl font-light">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <a href={`/api/invoice/${order.id}`} target="_blank">
              <Download className="h-4 w-4" /> Invoice
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 font-medium">Items</h3>
            <div className="space-y-4">
              {((order.order_items as OrderItem[] | null) || []).map((it) => (
                <div key={it.id} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {it.image_url && <Image src={it.image_url} alt={it.product_name} fill sizes="70px" className="object-cover" />}
                  </div>
                  <div className="flex flex-1 items-start justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{it.product_name}</p>
                      {it.variant_label && <p className="text-xs text-muted-foreground">{it.variant_label}</p>}
                      <p className="text-xs text-muted-foreground">Qty {it.quantity} × {formatPrice(it.unit_price)}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(it.line_total)}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-5" />
            <div className="space-y-1 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount_total > 0 && (
                <Row label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`} value={`−${formatPrice(order.discount_total)}`} />
              )}
              <Row label="Shipping" value={order.shipping_total === 0 ? "Free" : formatPrice(order.shipping_total)} />
              {order.tax_total > 0 && <Row label="Tax" value={formatPrice(order.tax_total)} />}
              {order.cod_fee > 0 && <Row label="COD fee" value={formatPrice(order.cod_fee)} />}
              <Separator className="my-2" />
              <Row label="Total" value={formatPrice(order.grand_total)} bold />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 font-medium">Internal note</h3>
            <OrderNoteEditor orderId={order.id} initial={order.admin_note} />
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-6">
            <h3 className="mb-3 font-medium">Status</h3>
            <OrderStatusControl
              orderId={order.id}
              status={order.status}
              paymentStatus={order.payment_status}
            />
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 font-medium">Customer</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">{order.customer_name}</p>
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 font-medium">Shipping address</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}</p>
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
              <p>{order.shipping_country}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 font-medium">Payment</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="uppercase text-xs tracking-widest text-foreground">{order.payment_method}</p>
              <p>Status: <span className="text-foreground">{order.payment_status}</span></p>
              {order.payment_reference && <p>Ref: {order.payment_reference}</p>}
            </div>
          </Card>

          {order.customer_note && (
            <Card className="p-6">
              <h3 className="mb-3 font-medium">Customer note</h3>
              <p className="text-sm text-muted-foreground">{order.customer_note}</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
