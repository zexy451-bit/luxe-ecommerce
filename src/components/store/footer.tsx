import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

export async function Footer() {
  const supabase = await createClient();
  const { data: s } = await supabase.from("store_settings").select("*").single();

  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/30">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-4">
        <div className="space-y-3">
          <div className="heading-display text-2xl font-semibold">{s?.store_name || "Luxe"}</div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Curated luxury essentials. Made with care, designed to last.
          </p>
          <div className="flex gap-2 pt-2">
            {s?.social_instagram && (
              <a href={s.social_instagram} className="rounded-full border p-2 hover:bg-card" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {s?.social_facebook && (
              <a href={s.social_facebook} className="rounded-full border p-2 hover:bg-card" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {s?.social_twitter && (
              <a href={s.social_twitter} className="rounded-full border p-2 hover:bg-card" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products">All products</Link></li>
            <li><Link href="/products?sort=newest">New arrivals</Link></li>
            <li><Link href="/products?featured=true">Featured</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{s?.store_email}</li>
            <li>{s?.store_phone}</li>
            <li>{s?.store_address}</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]">Newsletter</h4>
          <p className="mb-3 text-sm text-muted-foreground">
            Receive private invitations and seasonal previews.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {s?.store_name || "Luxe"}. All rights reserved.
      </div>
    </footer>
  );
}
