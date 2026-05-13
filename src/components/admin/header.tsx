"use client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search } from "lucide-react";

function initials(name: string | null, email: string) {
  const src = (name || email).trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function AdminHeader({ email, name }: { email: string; name: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-card/80 px-6 backdrop-blur-xl">
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search orders, products, customers..."
          className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="relative rounded-full p-2 hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>

        <div className="flex items-center gap-3 rounded-full border border-border/60 px-2 py-1 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold uppercase text-background">
            {initials(name, email)}
          </div>
          <div className="hidden text-right md:block">
            <p className="text-[11px] font-medium leading-tight">{name || email}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">Admin</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </header>
  );
}
