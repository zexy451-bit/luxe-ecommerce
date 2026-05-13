import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { Card } from "@/components/ui/card";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("id", id)
    .single();
  if (!product) notFound();

  const [cats, brands] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="heading-display text-3xl font-light">Edit product</h1>
      <ProductForm
        product={product}
        categories={cats.data || []}
        brands={brands.data || []}
      />
    </div>
  );
}
