"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Editorial() {
  return (
    <section className="container-wide my-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted lg:order-2"
        >
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600"
            alt="Atelier"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-xl lg:order-1"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Our atelier
          </p>
          <h2 className="heading-display mt-3 text-4xl font-light leading-[1.08] md:text-6xl">
            Quiet pieces, <span className="italic">considered</span> for a lifetime.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Every garment is cut and finished by hand in our small atelier — natural
            fibres, restrained silhouettes, the kind of construction you only feel after
            the tenth wear. Nothing seasonal. Nothing loud.
          </p>
          <Link
            href="/products"
            className="group mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-[0.28em]"
          >
            Discover the collection
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
