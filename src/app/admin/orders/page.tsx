import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate, STATUS_COLORS, ORDER_STATUSES } from "@/lib/utils";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; status?: string; page?: string }>;

export default async function AdminOrders({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from("orders").select("*", { count: "exact" });
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.q) q = q.or(`order_number.ilike.%${sp.q}%,customer_email.ilike.%${sp.q}%,customer_name.ilike.%${sp.q}%`);
  const { data, count } = await q.order("created_at", { ascending: false }).range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-display text-3xl font-light">Orders</h1>
          <p className="text-sm text-muted-foreground">{count ?? 0} orders</p>
        </div>
        <Button asChild variant="outline">
          <a href={`/admin/orders/export${sp.status ? `?status=${sp.status}` : ""}`} target="_blank">
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search order #, customer, email"
              defaultValue={sp.q || ""}
              className="pl-10"
            />
          </div>
          <select
            name="status"
            defaultValue={sp.status || ""}
            className="h-11 rounded-lg border border-input bg-card px-4 text-sm"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button>Filter</Button>
        </form>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="text-right px-6">Total</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No orders.</td></tr>
              )}
              {(data || []).map((o) => (
                <tr key={o.id} className="border-t hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td>
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                  </td>
                  <td className="text-muted-foreground">{formatDate(o.created_at)}</td>
                  <td className="text-xs uppercase tracking-wider">{o.payment_method} · {o.payment_status}</td>
                  <td>
                    <span className={`${STATUS_COLORS[o.status]} rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="text-right px-6 font-medium">{formatPrice(o.grand_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            Object.entries(sp).forEach(([k, v]) => v && params.set(k, v));
            params.set("page", String(p));
            return (
              <a
                key={p}
                href={`?${params}`}
                className={`h-9 min-w-[36px] rounded-full px-3 text-sm leading-9 ${
                  p === page ? "bg-foreground text-background" : "hover:bg-muted"
                }`}
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
