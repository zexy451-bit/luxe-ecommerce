import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Price } from "@/components/store/price";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import { CheckCircle2, Download } from "lucide-react";
import type { OrderItem } from "@/types/db";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!order) notFound();

  return (
    <div className="space-y-6">
      {sp.placed && (
        <Card className="border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-medium">Thank you — your order is placed.</p>
              <p className="text-sm text-muted-foreground">
                We'll send confirmation to {order.customer_email}.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="heading-display text-2xl font-light">{order.order_number}</h2>
            <p className="text-sm text-muted-foreground">Placed {formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`${STATUS_COLORS[order.status]} rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider`}>
              {order.status}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/api/invoice/${order.id}`} target="_blank">
                <Download className="h-3 w-3" /> Invoice
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          {((order.order_items as OrderItem[] | null) || []).map((it) => (
            <div key={it.id} className="flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {it.image_url && (
                  <Image src={it.image_url} alt={it.product_name} fill sizes="70px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 items-start justify-between">
                <div className="text-sm">
                  <p className="font-medium">{it.product_name}</p>
                  {it.variant_label && <p className="text-xs text-muted-foreground">{it.variant_label}</p>}
                  <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                </div>
                <Price amount={it.line_total} className="text-sm font-medium" />
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest">Shipping</h4>
            <div className="text-sm text-muted-foreground">
              <div>{order.customer_name}</div>
              <div>{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}</div>
              <div>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</div>
              <div>{order.shipping_country}</div>
              <div>{order.customer_phone}</div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest">Summary</h4>
            <div className="space-y-1 text-sm">
              <Row label="Subtotal" value={<Price amount={order.subtotal} />} />
              {order.discount_total > 0 && <Row label="Discount" value={<><span>−</span><Price amount={order.discount_total} /></>} />}
              <Row label="Shipping" value={order.shipping_total === 0 ? "Free" : <Price amount={order.shipping_total} />} />
              {order.tax_total > 0 && <Row label="Tax" value={<Price amount={order.tax_total} />} />}
              {order.cod_fee > 0 && <Row label="COD fee" value={<Price amount={order.cod_fee} />} />}
              <Separator className="my-2" />
              <Row label="Total" value={<Price amount={order.grand_total} bold />} bold />
              <p className="mt-2 text-xs text-muted-foreground">
                Payment: {order.payment_method.toUpperCase()} · {order.payment_status}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
