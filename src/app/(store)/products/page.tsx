import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductFilters } from "@/components/store/product-filters";
import type { Product } from "@/types/db";

export const revalidate = 30;

type SearchParams = Promise<{
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  sort?: string;
  q?: string;
  featured?: string;
  trending?: string;
  new?: string;
  bestseller?: string;
  page?: string;
}>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();

  const [categories, brands] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
    supabase.from("brands").select("*").eq("is_active", true).order("name"),
  ]);

  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("products")
    .select("*, product_images(*), brands(name, slug), categories(name, slug)", { count: "exact" })
    .eq("is_active", true);

  if (sp.category) {
    const cat = (categories.data || []).find((c) => c.slug === sp.category);
    if (cat) q = q.eq("category_id", cat.id);
  }
  if (sp.brand) {
    const br = (brands.data || []).find((b) => b.slug === sp.brand);
    if (br) q = q.eq("brand_id", br.id);
  }
  if (sp.min) q = q.gte("price", parseFloat(sp.min));
  if (sp.max) q = q.lte("price", parseFloat(sp.max));
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);
  if (sp.featured === "true") q = q.eq("is_featured", true);
  if (sp.trending === "true") q = q.eq("is_trending", true);
  if (sp.new === "true") q = q.eq("is_new_arrival", true);
  if (sp.bestseller === "true") q = q.eq("is_best_seller", true);

  switch (sp.sort) {
    case "price-asc": q = q.order("price", { ascending: true }); break;
    case "price-desc": q = q.order("price", { ascending: false }); break;
    case "name": q = q.order("name", { ascending: true }); break;
    case "newest":
    default: q = q.order("created_at", { ascending: false });
  }

  const { data, count } = await q.range(from, to);
  const products = (data || []) as Product[];
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="container-wide py-12">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Shop</p>
        <h1 className="heading-display mt-2 text-4xl font-light md:text-5xl">All products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {count ?? 0} {(count ?? 0) === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
        <aside>
          <ProductFilters
            categories={categories.data || []}
            brands={brands.data || []}
            current={sp}
          />
        </aside>
        <div>
          <ProductGrid products={products} />
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const url = new URLSearchParams();
                Object.entries(sp).forEach(([k, v]) => v && url.set(k, v));
                url.set("page", String(p));
                return (
                  <a
                    key={p}
                    href={`?${url}`}
                    className={`h-9 min-w-[36px] rounded-full px-3 text-sm leading-9 ${
                      p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
