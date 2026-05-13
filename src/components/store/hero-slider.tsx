"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/types/db";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides?.length) return null;
  const slide = slides[index];

  return (
    <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image_url}
            alt={slide.headline}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />
        </motion.div>
      </AnimatePresence>

      <div className="container-wide relative z-10 flex h-full flex-col justify-end pb-28 text-white">
        <div className="flex items-end justify-between gap-12">
          <motion.div
            key={`${slide.id}-text`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {slide.subheadline && (
              <p className="mb-4 text-[11px] uppercase tracking-[0.36em] text-white/75">
                {slide.subheadline}
              </p>
            )}
            <h1 className="heading-display text-[clamp(2.75rem,7vw,6.5rem)] font-light leading-[0.98] tracking-tight">
              {slide.headline}
            </h1>
            {slide.cta_label && slide.cta_href && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button asChild variant="gold" size="lg" className="mt-10">
                  <Link href={slide.cta_href}>{slide.cta_label}</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="hidden flex-col items-end gap-3 md:flex"
          >
            <span className="text-[10px] uppercase tracking-[0.32em] text-white/70">Scroll</span>
            <span className="block h-12 w-px bg-white/50 animate-scroll-cue" />
          </motion.div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-[2px] rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
