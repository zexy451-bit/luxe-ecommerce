"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Operations",
    items: [{ href: "/admin/orders", label: "Orders", icon: ShoppingCart }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
    ],
  },
  {
    label: "People",
    items: [{ href: "/admin/customers", label: "Customers", icon: Users }],
  },
  {
    label: "Configure",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function AdminSidebar({ storeName = "Luxe" }: { storeName?: string }) {
  const path = usePathname();
  return (
    <aside className="flex flex-col border-r border-border/60 bg-card lg:sticky lg:top-0 lg:h-screen">
      <div className="flex h-16 items-center border-b border-border/40 px-6">
        <Link href="/admin" className="heading-display text-xl font-semibold tracking-tight truncate">
          {storeName}
          <span className="ml-1.5 text-muted-foreground font-light">/ Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {g.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = it.exact
                  ? path === it.href
                  : path === it.href || path.startsWith(`${it.href}/`);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-foreground text-background shadow-soft"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {active && (
                      <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold" />
                    )}
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/40 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View store
        </Link>
      </div>
    </aside>
  );
}
