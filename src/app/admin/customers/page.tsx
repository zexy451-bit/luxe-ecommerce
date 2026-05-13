import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, orders(id, grand_total)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-light">Customers</h1>
        <p className="text-sm text-muted-foreground">{profiles?.length ?? 0} accounts</p>
      </div>
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Orders</th>
                <th className="text-right px-6">Spend</th>
              </tr>
            </thead>
            <tbody>
              {(profiles || []).map((p) => {
                const orders = (p as { orders?: { id: string; grand_total: number }[] }).orders || [];
                const total = orders.reduce((s, o) => s + Number(o.grand_total || 0), 0);
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-6 py-3 font-medium">{p.full_name || "—"}</td>
                    <td>{p.email}</td>
                    <td className="text-muted-foreground">{p.phone || "—"}</td>
                    <td>
                      <Badge variant={p.role === "admin" ? "gold" : "secondary"}>{p.role}</Badge>
                    </td>
                    <td className="text-muted-foreground">{formatDate(p.created_at)}</td>
                    <td className="text-right">{orders.length}</td>
                    <td className="text-right px-6 font-medium">${total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
