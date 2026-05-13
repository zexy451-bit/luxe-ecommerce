"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUSES } from "@/lib/utils";
import { toast } from "sonner";
import { updateOrderAction } from "@/app/admin/orders/[id]/actions";

export function OrderStatusControl({
  orderId, status, paymentStatus,
}: { orderId: string; status: string; paymentStatus: string }) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [ps, setPs] = useState(paymentStatus);
  const [pending, start] = useTransition();

  type OrderStatusLiteral = typeof ORDER_STATUSES[number];
  type PaymentStatusLiteral = "unpaid" | "paid" | "refunded" | "failed";

  const update = (next: { status?: OrderStatusLiteral; paymentStatus?: PaymentStatusLiteral }) => {
    start(async () => {
      const res = await updateOrderAction({ orderId, ...next });
      if (!res.ok) {
        toast.error(res.error || "Update failed");
        router.refresh();
        return;
      }
      toast.success("Order updated");
      // The server action already called revalidatePath on the relevant routes,
      // so router.refresh() pulls the freshly invalidated server data.
      router.refresh();

      if (next.status) {
        try {
          const r = await fetch(`/api/orders/${orderId}/notify-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: next.status }),
          });
          const json = await r.json();
          if (r.ok && json.sent) toast.success("Customer notified by email");
          else if (json.skipped) {/* no email for this status */}
          else if (!r.ok) toast.error("Email failed: " + (json.error || r.status));
        } catch (e) {
          toast.error("Email failed: " + (e as Error).message);
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Fulfillment</p>
        <Select
          value={s}
          onValueChange={(v) => { setS(v); update({ status: v as OrderStatusLiteral }); }}
          disabled={pending}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Payment</p>
        <Select
          value={ps}
          onValueChange={(v) => { setPs(v); update({ paymentStatus: v as PaymentStatusLiteral }); }}
          disabled={pending}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["unpaid","paid","refunded","failed"].map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
