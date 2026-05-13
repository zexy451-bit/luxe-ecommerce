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

  const products = (data || [])
    .map((r) => (r as { products: Product }).products)
    .filter(Boolean);

  if (products.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Your wishlist is empty.
      </Card>
    );
  }
  return <ProductGrid products={products} />;
}
