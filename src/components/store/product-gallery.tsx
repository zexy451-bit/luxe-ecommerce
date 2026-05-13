"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/db";

export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const sorted = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order
  );
  const list = sorted.length
    ? sorted
    : ([{ id: "fb", url: "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=1200", alt: null, display_order: 0, is_primary: true, product_id: "" }] as ProductImage[]);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 0, y: 0 });
  const current = list[active];

  return (
    <div>
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
        onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            on: true,
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
      >
        <Image
          src={current.url}
          alt={current.alt || alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-300",
            zoom.on ? "scale-150" : "scale-100"
          )}
          style={zoom.on ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
      </div>
      {list.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                i === active ? "border-foreground" : "border-transparent"
              )}
            >
              <Image src={img.url} alt={img.alt || alt} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
