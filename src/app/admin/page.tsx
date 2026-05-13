import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingBag, Clock, Boxes, Users,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate, STATUS_COLORS } from "@/lib/utils";
import { SalesChart } from "@/components/admin/sales-chart";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [allOrdersRes, todaysOrdersRes, pendingRes, lowStockRes, customersRes, recentOrdersRes] = await Promise.all([
    supabase.from("orders").select("grand_total, status, created_at"),
    supabase
      .from("orders")
      .select("grand_total")
      .gte("created_at", today.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 5)
      .order("stock"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const allOrders = allOrdersRes.data || [];
  const totalRevenue = allOrders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((s, o) => s + Number(o.grand_total || 0), 0);
  const todaysRevenue = (todaysOrdersRes.data || []).reduce((s, o) => s + Number(o.grand_total || 0), 0);

  // chart series: last 30 days
  const series = Array.from({ length: 30 }, (_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (29 - i));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const total = allOrders
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= day && d < next && o.status !== "cancelled";
      })
      .reduce((s, o) => s + Number(o.grand_total || 0), 0);
    return { label: day.toISOString().slice(5, 10), value: total };
  });

  // sparkline series: last 7 days
  const last7 = series.slice(-7).map((s) => s.value);
  const prev7 = series.slice(-14, -7).map((s) => s.value);
  const last7Sum = last7.reduce((a, b) => a + b, 0);
  const prev7Sum = prev7.reduce((a, b) => a + b, 0);
  const trend7 = prev7Sum === 0 ? 0 : ((last7Sum - prev7Sum) / prev7Sum) * 100;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="heading-display mt-1 text-4xl font-light">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Here's how your store is performing today.
          </p>
        </div>
        <div className="hidden rounded-full border border-border/60 bg-card px-4 py-2 text-xs text-muted-foreground md:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(totalRevenue)}
          hint="All-time"
          icon={DollarSign}
          spark={series.map((s) => s.value)}
          trend={trend7}
        />
        <StatCard
          label="Today"
          value={formatPrice(todaysRevenue)}
          hint={`${todaysOrdersRes.data?.length || 0} orders`}
          icon={ShoppingBag}
          spark={last7}
        />
        <StatCard
          label="Pending orders"
          value={String(pendingRes.count ?? 0)}
          icon={Clock}
          tone={(pendingRes.count ?? 0) > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Customers"
          value={String(customersRes.count ?? 0)}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Revenue · last 30 days</h3>
            <span className="text-xs text-muted-foreground">USD</span>
          </div>
          <SalesChart data={series} />
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2"><Boxes className="h-4 w-4" /> Low stock</h3>
            <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {(lowStockRes.data?.length || 0) === 0 ? (
            <p className="text-sm text-muted-foreground">All stocked up.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowStockRes.data!.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline truncate max-w-[220px]">
                    {p.name}
                  </Link>
                  <Badge variant={p.stock === 0 ? "destructive" : "warning"}>{p.stock}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Recent orders</h3>
          <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2">Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrdersRes.data || []).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="text-muted-foreground">{o.customer_name}</td>
                  <td className="text-muted-foreground">{formatDate(o.created_at)}</td>
                  <td>
                    <span className={`${STATUS_COLORS[o.status]} rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="text-right font-medium">{formatPrice(o.grand_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
