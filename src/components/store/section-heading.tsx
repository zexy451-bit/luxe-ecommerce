import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  ctaLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mb-12 flex items-end justify-between gap-6 border-b border-border/40 pb-6">
      <div>
        {eyebrow && (
          <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-foreground/40" />
            {eyebrow}
          </p>
        )}
        <h2 className="heading-display text-3xl font-light leading-tight md:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.28em] md:inline-flex"
        >
          {ctaLabel}
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}
