"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const statusSchema = z.object({
  orderId: z.string().uuid(),
  status: z
    .enum(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"])
    .optional(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "failed"]).optional(),
  adminNote: z.string().max(2000).optional(),
});

export async function updateOrderAction(input: z.infer<typeof statusSchema>) {
  await requireAdmin();
  const parsed = statusSchema.parse(input);
  const admin = createAdminClient();

  const updates: Record<string, string> = {};
  if (parsed.status) updates.status = parsed.status;
  if (parsed.paymentStatus) updates.payment_status = parsed.paymentStatus;
  if (parsed.adminNote !== undefined) updates.admin_note = parsed.adminNote;

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "Nothing to update" };
  }

  const { error } = await admin
    .from("orders")
    .update(updates)
    .eq("id", parsed.orderId);

  if (error) return { ok: false, error: error.message };

  // Invalidate cached views so the change is visible everywhere immediately.
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.orderId}`);
  revalidatePath(`/account/orders/${parsed.orderId}`);

  return { ok: true };
}
