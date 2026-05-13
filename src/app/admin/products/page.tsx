import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string }>;

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase
    .from("products")
    .select("*, product_images(url, is_primary), categories(name)")
    .order("created_at", { ascending: false });
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);
  const { data } = await q;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="heading-display text-3xl font-light">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} items</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="h-4 w-4" /> Add product</Link>
        </Button>
      </div>

      <Card className="p-4">
        <form className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={sp.q || ""} placeholder="Search products..." className="pl-10" />
        </form>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Flags</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((p) => {
                const img = p.product_images?.find((i) => i.is_primary)?.url || p.product_images?.[0]?.url;
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:underline">
                        <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                          {img && <Image src={img} alt={p.name} fill sizes="40px" className="object-cover" />}
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </Link>
                    </td>
                    <td className="text-muted-foreground">{p.categories?.name || "—"}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>
                      {p.stock === 0 ? <Badge variant="destructive">0</Badge> :
                       p.stock <= 5 ? <Badge variant="warning">{p.stock}</Badge> :
                       <span>{p.stock}</span>}
                    </td>
                    <td className="space-x-1">
                      {p.is_featured && <Badge variant="gold">Featured</Badge>}
                      {p.is_new_arrival && <Badge variant="secondary">New</Badge>}
                      {p.is_trending && <Badge variant="secondary">Trending</Badge>}
                      {p.is_best_seller && <Badge variant="secondary">Best</Badge>}
                    </td>
                    <td>
                      <Badge variant={p.is_active ? "success" : "secondary"}>
                        {p.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </td>
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
