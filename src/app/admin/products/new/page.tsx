import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [cats, brands] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="heading-display text-3xl font-light">New product</h1>
      <ProductForm categories={cats.data || []} brands={brands.data || []} />
    </div>
  );
}
