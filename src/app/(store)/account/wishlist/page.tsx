import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ProductGrid } from "@/components/store/product-grid";
import type { Product } from "@/types/db";

export default async function WishlistPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist")
    .select("products(*, product_images(*), brands(name, slug))")
    .eq("user_id", user.id);

  // Supabase types the joined relation loosely; safe to coerce here since the
  // shape comes from our select() string above.
  const rows = (data ?? []) as unknown as Array<{ products: Product | Product[] | null }>;
  const products: Product[] = rows
    .map((r) => (Array.isArray(r.products) ? r.products[0] : r.products))
    .filter((p): p is Product => !!p);

  if (products.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Your wishlist is empty.
      </Card>
    );
  }
  return <ProductGrid products={products} />;
}
