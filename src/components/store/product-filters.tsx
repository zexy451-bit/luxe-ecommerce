"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Brand } from "@/types/db";

export function ProductFilters({
  categories,
  brands,
  current,
}: {
  categories: Category[];
  brands: Brand[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(current.q || "");
  const [min, setMin] = useState(current.min || "");
  const [max, setMax] = useState(current.max || "");

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(sp);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params}`);
  };

  return (
    <div className="space-y-7">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]">Search</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", search || null);
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]">Sort</h4>
        <Select value={current.sort || "newest"} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]">Category</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/products"
              className={!current.category ? "font-medium" : "text-muted-foreground"}
            >
              All
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/products?category=${c.slug}`}
                className={current.category === c.slug ? "font-medium" : "text-muted-foreground"}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {brands.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]">Brand</h4>
            <ul className="space-y-2 text-sm">
              {brands.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/products?brand=${b.slug}`}
                    className={current.brand === b.slug ? "font-medium" : "text-muted-foreground"}
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Separator />

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]">Price</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams(sp);
            if (min) params.set("min", min); else params.delete("min");
            if (max) params.set("max", max); else params.delete("max");
            params.delete("page");
            router.push(`/products?${params}`);
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} type="number" />
            <Input placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} type="number" />
          </div>
          <Button type="submit" size="sm" variant="outline" className="w-full">Apply</Button>
        </form>
      </div>
    </div>
  );
}
