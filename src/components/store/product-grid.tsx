import { ProductCard } from "./product-card";
import type { Product } from "@/types/db";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products?.length) {
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
        No products yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
