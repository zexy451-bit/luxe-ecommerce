import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartIconButton } from "./cart-icon-button";
import { UserMenu } from "./user-menu";
import { CurrencySwitcher } from "./currency-switcher";
import { Search } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("store_name, logo_url")
    .single();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("display_order");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between gap-6">
        <Link href="/" className="heading-display text-2xl font-semibold tracking-tight">
          {settings?.store_name || "Luxe"}
        </Link>
        <nav className="hidden gap-7 text-sm md:flex">
          <Link href="/products" className="hover:text-accent transition-colors">Shop all</Link>
          {(categories || []).slice(0, 5).map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="hover:text-accent transition-colors">
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/products" className="rounded-full p-2 hover:bg-muted" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <CurrencySwitcher />
          <UserMenu />
          <CartIconButton />
        </div>
      </div>
    </header>
  );
}
