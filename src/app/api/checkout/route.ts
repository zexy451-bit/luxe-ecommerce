import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcBreakdown } from "@/lib/pricing";
import { sendOrderConfirmation } from "@/lib/email";

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    fullName: z.string().min(1).max(120),
    phone: z.string().trim().min(6, "phone number too short").max(40),
    note: z.string().max(1000).optional(),
  }),
  address: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(80),
    state: z.string().min(1).max(80),
    postal: z.string().min(1).max(20),
    country: z.string().min(1).max(40),
  }),
  payment: z.object({
    method: z.enum(["cod", "qr"]),
    reference: z.string().max(200).optional(),
  }),
  coupon: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable().optional(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(req: NextRequest) {
  try {
  let body;
  try {
    body = checkoutSchema.parse(await req.json());
  } catch (e) {
    console.error("[checkout] invalid input:", e);
    if (e instanceof z.ZodError) {
      const msg = e.issues
        .map((i) => {
          const field = String(i.path[i.path.length - 1] ?? "field");
          return `${field}: ${i.message.replace(/^String must contain at least (\d+) character\(s\)$/, "must be at least $1 characters")}`;
        })
        .join(" · ");
      return NextResponse.json({ error: `Please fix: ${msg}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch authoritative prices server-side (never trust client)
  const productIds = [...new Set(body.items.map((i) => i.productId))];
  const { data: products, error: prodErr } = await admin
    .from("products")
    .select("id, name, price, stock, product_images(url, is_primary)")
    .in("id", productIds)
    .eq("is_active", true);

  if (prodErr) {
    console.error("[checkout] product fetch error:", prodErr);
    return NextResponse.json({ error: "DB error reading products: " + prodErr.message }, { status: 500 });
  }
  if (!products || products.length !== productIds.length) {
    console.error("[checkout] products mismatch. requested:", productIds, "got:", products?.map(p => p.id));
    return NextResponse.json({ error: "Some products are unavailable" }, { status: 400 });
  }

  const variantIds = body.items
    .map((i) => i.variantId)
    .filter((v): v is string => !!v);
  const { data: variants } = variantIds.length
    ? await admin
        .from("product_variants")
        .select("id, product_id, name, price_modifier, stock")
        .in("id", variantIds)
    : { data: [] as Array<{ id: string; product_id: string; name: string; price_modifier: number; stock: number }> };

  const lines = body.items.map((it) => {
    const p = products.find((x) => x.id === it.productId)!;
    const v = it.variantId ? variants?.find((x) => x.id === it.variantId) : null;
    const stock = v ? v.stock : p.stock;
    if (stock < it.quantity) {
      throw new Error(`${p.name} — only ${stock} available`);
    }
    const unit = +(Number(p.price) + Number(v?.price_modifier || 0)).toFixed(2);
    return {
      productId: p.id,
      variantId: v?.id || null,
      productName: p.name,
      variantLabel: v?.name || null,
      unitPrice: unit,
      quantity: it.quantity,
      lineTotal: +(unit * it.quantity).toFixed(2),
      image: (p.product_images?.find((i) => i.is_primary) || p.product_images?.[0])?.url || null,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  // Coupon
  let coupon = null as null | { code: string; type: "percentage" | "fixed"; value: number; min_order_amount: number | null; max_discount: number | null; is_active: boolean };
  if (body.coupon) {
    const { data: c } = await admin
      .from("coupons")
      .select("*")
      .eq("code", body.coupon)
      .eq("is_active", true)
      .maybeSingle();
    if (c) coupon = c as typeof coupon;
  }

  const { data: paymentSettings, error: psErr } = await admin.from("payment_settings").select("*").single();
  const { data: shippingSettings, error: ssErr } = await admin.from("shipping_settings").select("*").single();
  if (psErr || ssErr || !paymentSettings || !shippingSettings) {
    console.error("[checkout] settings missing", { psErr, ssErr, paymentSettings, shippingSettings });
    return NextResponse.json({ error: "Store misconfigured — payment/shipping settings missing. Run migrations." }, { status: 500 });
  }

  if (body.payment.method === "cod" && !paymentSettings.cod_enabled) {
    return NextResponse.json({ error: "COD is disabled" }, { status: 400 });
  }
  if (body.payment.method === "qr" && !paymentSettings.qr_enabled) {
    return NextResponse.json({ error: "QR payment is disabled" }, { status: 400 });
  }

  const totals = calcBreakdown(
    subtotal,
    coupon as never,
    paymentSettings,
    shippingSettings,
    body.payment.method
  );

  // Insert order
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      customer_email: body.customer.email,
      customer_name: body.customer.fullName,
      customer_phone: body.customer.phone,
      customer_note: body.customer.note ?? null,
      shipping_line1: body.address.line1,
      shipping_line2: body.address.line2 ?? null,
      shipping_city: body.address.city,
      shipping_state: body.address.state,
      shipping_postal_code: body.address.postal,
      shipping_country: body.address.country,
      subtotal: totals.subtotal,
      discount_total: totals.discount,
      shipping_total: totals.shipping,
      tax_total: totals.tax,
      cod_fee: totals.codFee,
      grand_total: totals.grandTotal,
      coupon_code: coupon?.code ?? null,
      payment_method: body.payment.method,
      payment_reference: body.payment.reference ?? null,
      payment_status: "unpaid",
      status: "pending",
    })
    .select("id, order_number")
    .single();

  if (error || !order) {
    console.error("[checkout] order insert failed:", error);
    return NextResponse.json({ error: "Could not create order: " + (error?.message || "unknown") }, { status: 500 });
  }

  // Insert items
  const { error: itemsErr } = await admin.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      variant_id: l.variantId,
      product_name: l.productName,
      variant_label: l.variantLabel,
      unit_price: l.unitPrice,
      quantity: l.quantity,
      line_total: l.lineTotal,
      image_url: l.image,
    }))
  );
  if (itemsErr) {
    console.error("[checkout] order_items insert failed:", itemsErr);
    return NextResponse.json({ error: "Could not save items: " + itemsErr.message }, { status: 500 });
  }

  // Decrement stock
  for (const l of lines) {
    if (l.variantId) {
      const { data: v } = await admin
        .from("product_variants")
        .select("stock")
        .eq("id", l.variantId)
        .single();
      if (v) {
        await admin
          .from("product_variants")
          .update({ stock: Math.max(0, v.stock - l.quantity) })
          .eq("id", l.variantId);
      }
    } else {
      const { data: p } = await admin
        .from("products")
        .select("stock")
        .eq("id", l.productId)
        .single();
      if (p) {
        await admin
          .from("products")
          .update({ stock: Math.max(0, p.stock - l.quantity) })
          .eq("id", l.productId);
      }
    }
  }

  if (coupon) {
    const { data: c } = await admin
      .from("coupons")
      .select("used_count")
      .eq("code", coupon.code)
      .single();
    if (c) {
      await admin
        .from("coupons")
        .update({ used_count: c.used_count + 1 })
        .eq("code", coupon.code);
    }
  }

  const { error: invErr } = await admin.from("invoices").insert({
    order_id: order.id,
    invoice_number: `INV-${order.order_number}`,
  });
  if (invErr) console.error("[checkout] invoice insert failed (non-fatal):", invErr);

  // Fire-and-forget confirmation email. Don't fail the checkout if email fails.
  try {
    const { data: storeSettings } = await admin.from("store_settings").select("*").single();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendOrderConfirmation({
      customerName: body.customer.fullName,
      customerEmail: body.customer.email,
      orderNumber: order.order_number,
      orderDate: new Date().toISOString(),
      items: lines.map((l) => ({
        name: l.productName,
        variant: l.variantLabel,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        imageUrl: l.image,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode: coupon?.code ?? null,
      shippingFee: totals.shipping,
      tax: totals.tax,
      codFee: totals.codFee,
      total: totals.grandTotal,
      currencySymbol: storeSettings?.currency_symbol || "Rs.",
      paymentMethod:
        body.payment.method === "cod" ? "Cash on Delivery" : "QR Payment",
      paymentStatus: "Unpaid",
      shippingAddress: {
        fullName: body.customer.fullName,
        line1: body.address.line1,
        line2: body.address.line2 ?? null,
        city: body.address.city,
        state: body.address.state,
        postalCode: body.address.postal,
        country: body.address.country,
        phone: body.customer.phone,
      },
      estimatedDelivery: "3–5 business days",
      trackOrderUrl: `${siteUrl}/account/orders/${order.id}`,
      supportEmail: storeSettings?.store_email || "hello@luxe.com",
      supportPhone: storeSettings?.store_phone || undefined,
      storeName: storeSettings?.store_name || "Luxe",
      storeAddress: storeSettings?.store_address || undefined,
      storeLogoUrl: storeSettings?.logo_url || undefined,
      baseUrl: siteUrl,
    });
  } catch (e) {
    console.error("[checkout] confirmation email failed (non-fatal):", e);
  }

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
  } catch (err) {
    console.error("[checkout] uncaught error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
