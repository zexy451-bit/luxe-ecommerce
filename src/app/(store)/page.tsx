import { createClient } from "@/lib/supabase/server";
import { HeroSlider } from "@/components/store/hero-slider";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { Testimonials } from "@/components/store/testimonials";
import { PromoPopup } from "@/components/store/promo-popup";
import { FlashSaleCountdown } from "@/components/store/flash-sale";
import { Marquee } from "@/components/store/marquee";
import { Editorial } from "@/components/store/editorial";
import { PressStrip } from "@/components/store/press-strip";
import type { Product } from "@/types/db";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

async function fetchProducts(filter: Record<string, unknown>) {
  const supabase = await createClient();
  let q = supabase
    .from("products")
    .select("*, product_images(*), brands(name, slug), categories(name, slug)")
    .eq("is_active", true);
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v as boolean);
  const { data } = await q.order("created_at", { ascending: false }).limit(8);
  return (data || []) as Product[];
}

export default async function HomePage() {
  const supabase = await createClient();

  const [slidesRes, sectionsRes, categoriesRes, promoRes, featured, trending, newArrivals, bestSellers] =
    await Promise.all([
      supabase.from("hero_slides").select("*").eq("is_active", true).order("display_order"),
      supabase.from("homepage_sections").select("*").eq("is_enabled", true).order("display_order"),
      supabase.from("categories").select("*").eq("is_active", true).order("display_order").limit(4),
      supabase.from("promotions").select("*").eq("is_active", true).order("ends_at").limit(1),
      fetchProducts({ is_featured: true }),
      fetchProducts({ is_trending: true }),
      fetchProducts({ is_new_arrival: true }),
      fetchProducts({ is_best_seller: true }),
    ]);

  const sectionsByKey = Object.fromEntries(
    (sectionsRes.data || []).map((s) => [s.key, s])
  );
  const enabled = (key: string) => sectionsByKey[key]?.is_enabled !== false;

  return (
    <>
      <PromoPopup />
      <HeroSlider slides={slidesRes.data || []} />

      <Marquee
        items={[
          "Cashmere",
          "Italian wool",
          "Vegetable-tanned leather",
          "Hand-finished",
          "Made to last",
          "Considered design",
        ]}
      />

      {(categoriesRes.data?.length || 0) > 0 && (
        <section className="container-wide my-24">
          <SectionHeading
            eyebrow="Collections"
            title="Shop by category"
            subtitle="Curated selections across the season"
          />
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {categoriesRes.data!.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={
                    c.image_url ||
                    "https://images.unsplash.com/photo-1467043153537-a4fba2cd39ef?w=900"
                  }
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-5 left-5 text-white">
                  <h3 className="heading-display text-2xl font-light">{c.name}</h3>
                  <p className="text-xs uppercase tracking-widest opacity-80">Shop now</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {enabled("featured") && featured.length > 0 && (
        <section className="container-wide my-24">
          <SectionHeading
            eyebrow="Editor's choice"
            title={sectionsByKey.featured?.title || "Featured collections"}
            subtitle={sectionsByKey.featured?.subtitle}
            href="/products?featured=true"
          />
          <ProductGrid products={featured} />
        </section>
      )}

      {promoRes.data?.[0] && (
        <FlashSaleCountdown
          endsAt={promoRes.data[0].ends_at}
          title={promoRes.data[0].title}
        />
      )}

      {enabled("trending") && trending.length > 0 && (
        <section className="container-wide my-24">
          <SectionHeading
            eyebrow="In demand"
            title={sectionsByKey.trending?.title || "Trending now"}
            subtitle={sectionsByKey.trending?.subtitle}
            href="/products?trending=true"
          />
          <ProductGrid products={trending} />
        </section>
      )}

      <Editorial />

      <PressStrip />

      {enabled("new_arrivals") && newArrivals.length > 0 && (
        <section className="container-wide my-24">
          <SectionHeading
            eyebrow="Just landed"
            title={sectionsByKey.new_arrivals?.title || "New arrivals"}
            subtitle={sectionsByKey.new_arrivals?.subtitle}
            href="/products?new=true"
          />
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {enabled("best_sellers") && bestSellers.length > 0 && (
        <section className="container-wide my-24">
          <SectionHeading
            eyebrow="Loved most"
            title={sectionsByKey.best_sellers?.title || "Best sellers"}
            subtitle={sectionsByKey.best_sellers?.subtitle}
            href="/products?bestseller=true"
          />
          <ProductGrid products={bestSellers} />
        </section>
      )}

      <Testimonials />

      <section className="container-wide my-32">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-20 text-center text-primary-foreground md:px-16 md:py-28">
          <p className="text-[11px] uppercase tracking-[0.34em] opacity-70">
            Private invitations
          </p>
          <h3 className="heading-display mt-4 text-4xl font-light leading-tight md:text-6xl">
            Join the inner circle.
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm opacity-80 md:text-base">
            First access to new pieces, seasonal previews, and member-only events.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-gold px-7 text-xs font-medium uppercase tracking-widest text-black transition hover:bg-gold/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
