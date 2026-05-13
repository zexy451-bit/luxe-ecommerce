"use client";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({
  className,
  variant = "link",
}: {
  className?: string;
  variant?: "link" | "button";
}) {
  const handler = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (variant === "button") {
    return (
      <button
        onClick={handler}
        className={
          className ||
          "inline-flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 px-4 py-2.5 text-xs uppercase tracking-widest text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        }
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={handler}
      className={
        className ||
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      }
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
