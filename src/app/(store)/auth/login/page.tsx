"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) return toast.error(friendlyAuthError(error));
        toast.success("Welcome back");
        router.replace(next);
        router.refresh();
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="text-right text-xs">
        <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/auth/signup" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
      <div className="relative my-4 flex items-center">
        <span className="flex-1 border-t border-border" />
        <span className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
        <span className="flex-1 border-t border-border" />
      </div>
      <Button asChild variant="outline" size="lg" className="w-full">
        <Link href="/products">
          <ShoppingBag className="h-4 w-4" /> Continue without account
        </Link>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        You can check out as a guest — order updates are still emailed to you.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="w-[420px] max-w-full p-8">
          <div className="mb-6 text-center">
            <h1 className="heading-display text-3xl font-light">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
          </div>
          <Suspense fallback={null}><LoginForm /></Suspense>
        </Card>
      </motion.div>
    </div>
  );
}
