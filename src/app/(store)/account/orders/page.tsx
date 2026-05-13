import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/store/price";
import { formatDate, STATUS_COLORS } from "@/lib/utils";

export default async function OrdersPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, grand_total, status, created_at, order_items(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link key={o.id} href={`/account/orders/${o.id}`}>
          <Card className="p-5 transition hover:shadow-lux">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
              </div>
              <div className="text-sm text-muted-foreground">{o.order_items?.length || 0} items</div>
              <div className={`${STATUS_COLORS[o.status]} rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider`}>
                {o.status}
              </div>
              <Price amount={o.grand_total} className="font-semibold" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
