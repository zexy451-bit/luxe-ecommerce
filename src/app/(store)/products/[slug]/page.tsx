import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductActions } from "@/components/store/product-actions";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { Price } from "@/components/store/price";
import { Badge } from "@/components/ui/badge";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";
import type { Product } from "@/types/db";

export const revalidate = 30;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "*, product_images(*), product_variants(*), brands(name, slug), categories(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*, product_images(*), brands(name, slug)")
    .eq("is_active", true)
    .neq("id", product.id)
    .eq("category_id", product.category_id || "")
    .limit(4);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", product.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="container-wide py-10">
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.product_images || []} alt={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.brands?.name && (
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              {product.brands.name}
            </p>
          )}
          <h1 className="heading-display mt-2 text-4xl font-light leading-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <Price amount={product.price} className="text-2xl font-semibold" />
            {onSale && (
              <Price amount={product.compare_at_price!} className="text-base text-muted-foreground line-through" />
            )}
            {onSale && <Badge variant="destructive">Sale</Badge>}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {product.stock > 0 ? (
              product.stock < 5 ? (
                <span className="text-amber-700">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-700">In stock</span>
              )
            ) : (
              <span className="text-rose-700">Sold out</span>
            )}
          </p>

          {product.short_description && (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.short_description}
            </p>
          )}

          <ProductActions product={product as Product} />

          {product.description && (
            <div className="mt-10 space-y-2 border-t pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">Details</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div className="mt-8 grid gap-4 border-t pt-6 text-xs sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-medium">Delivery</div>
                <div className="text-muted-foreground">3–5 business days</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RotateCcw className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-medium">Returns</div>
                <div className="text-muted-foreground">30-day window</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-medium">Authenticity</div>
                <div className="text-muted-foreground">Verified at source</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(reviews?.length || 0) > 0 && (
        <section className="mt-24 max-w-3xl">
          <h2 className="heading-display text-2xl font-light">Customer reviews</h2>
          <div className="mt-6 space-y-6">
            {(reviews || []).map((r) => (
              <div key={r.id} className="border-b pb-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {r.profiles?.full_name || "Anonymous"}
                  </div>
                  <div className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                </div>
                {r.title && <div className="mt-2 text-sm font-medium">{r.title}</div>}
                {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {(related?.length || 0) > 0 && (
        <section className="mt-24">
          <SectionHeading
            eyebrow="You may also like"
            title="Related pieces"
          />
          <ProductGrid products={related as Product[]} />
        </section>
      )}
    </div>
  );
}
