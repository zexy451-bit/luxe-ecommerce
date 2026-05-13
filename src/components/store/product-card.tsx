"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/db";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const images = product.product_images || [];
  const primary =
    images.find((i) => i.is_primary)?.url ||
    images[0]?.url ||
    "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=900";
  const hover = images.find((i) => !i.is_primary)?.url || primary;
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const discount = onSale
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
          />
          {hover !== primary && (
            <Image
              src={hover}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.is_new_arrival && <Badge variant="gold">New</Badge>}
            {onSale && <Badge variant="destructive">−{discount}%</Badge>}
            {product.stock <= 0 && <Badge variant="secondary">Sold out</Badge>}
          </div>

          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-between gap-2 rounded-full bg-background/95 px-4 py-2.5 shadow-soft backdrop-blur-sm">
              <span className="text-xs font-medium uppercase tracking-widest">View details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tracking-tight">{product.name}</p>
            {product.brands?.name && (
              <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                {product.brands.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <Price amount={product.price} className="text-sm font-semibold tabular-nums" />
            {onSale && (
              <Price
                amount={product.compare_at_price!}
                className="block text-xs text-muted-foreground line-through tabular-nums"
              />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
