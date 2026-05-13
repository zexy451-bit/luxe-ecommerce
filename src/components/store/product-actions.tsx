"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/types/db";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const variants = (product.product_variants || []) as ProductVariant[];
  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id || null);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  const variant = variants.find((v) => v.id === variantId);
  const price = product.price + (variant?.price_modifier || 0);
  const stock = variant?.stock ?? product.stock;
  const primary =
    product.product_images?.find((i) => i.is_primary)?.url ||
    product.product_images?.[0]?.url ||
    null;

  const handleAdd = (buyNow = false) => {
    if (stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    add({
      productId: product.id,
      variantId: variant?.id || null,
      name: product.name,
      variantLabel: variant?.name || null,
      price,
      quantity: qty,
      image: primary,
      slug: product.slug,
      stock,
    });
    if (buyNow) router.push("/checkout");
    else toast.success("Added to cart");
  };

  const toggleWishlist = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in to save favourites");
      router.push(`/auth/login?next=/products/${product.slug}`);
      return;
    }
    const { error } = await supabase
      .from("wishlist")
      .upsert({ user_id: user.id, product_id: product.id });
    if (error) toast.error("Couldn't save");
    else toast.success("Saved to wishlist");
  };

  return (
    <div className="mt-8 space-y-5">
      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]">
            Options
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs",
                  variantId === v.id ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-muted rounded-l-full"
            aria-label="Decrease"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[28px] text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            className="px-3 py-2 hover:bg-muted rounded-r-full"
            aria-label="Increase"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground">Qty</div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={() => handleAdd(false)} disabled={stock <= 0}>
          Add to cart
        </Button>
        <Button size="lg" variant="gold" className="flex-1" onClick={() => handleAdd(true)} disabled={stock <= 0}>
          Buy now
        </Button>
        <Button size="lg" variant="outline" onClick={toggleWishlist} aria-label="Add to wishlist">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
