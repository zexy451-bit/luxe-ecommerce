import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusUpdate, STATUSES_WITH_EMAIL } from "@/lib/email";
import type { OrderStatus } from "../../../../../../emails/order-status-update";

const bodySchema = z.object({
  status: z.enum([
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingCarrier: z.string().max(120).optional(),
  trackingNumber: z.string().max(120).optional(),
  trackingUrl: z.string().url().optional(),
  estimatedDelivery: z.string().max(120).optional(),
  customMessage: z.string().max(2000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Admin-only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!STATUSES_WITH_EMAIL.includes(body.status as OrderStatus)) {
    return NextResponse.json(
      { error: `No email is sent for status "${body.status}"`, skipped: true },
      { status: 200 }
    );
  }

  const admin = createAdminClient();
  const [{ data: order }, { data: storeSettings }] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("store_settings").select("*").single(),
  ]);

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const result = await sendOrderStatusUpdate({
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      orderNumber: order.order_number,
      status: body.status as OrderStatus,
      estimatedDelivery: body.estimatedDelivery,
      trackingCarrier: body.trackingCarrier,
      trackingNumber: body.trackingNumber,
      trackingUrl: body.trackingUrl,
      orderUrl: `${siteUrl}/account/orders/${order.id}`,
      supportEmail: storeSettings?.store_email || "hello@luxe.com",
      supportPhone: storeSettings?.store_phone || undefined,
      storeName: storeSettings?.store_name || "Luxe",
      storeAddress: storeSettings?.store_address || undefined,
      storeLogoUrl: storeSettings?.logo_url || undefined,
      customMessage: body.customMessage,
    });
    return NextResponse.json({ sent: true, id: result.data?.id || null });
  } catch (e) {
    console.error("[notify-status] failed:", e);
    return NextResponse.json(
      { error: (e as Error).message || "Email failed" },
      { status: 500 }
    );
  }
}
