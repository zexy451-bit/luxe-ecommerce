"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="w-[420px] max-w-full p-8">
          <div className="mb-6 text-center">
            <h1 className="heading-display text-3xl font-light">Create account</h1>
            <p className="mt-1 text-sm text-muted-foreground">A few seconds to start shopping</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (password.length < 8) return toast.error("Use at least 8 characters for your password.");
              setLoading(true);
              const supabase = createClient();
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: { full_name: fullName },
                  emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
              });
              setLoading(false);
              if (error) return toast.error(friendlyAuthError(error));
              // If email confirmation is disabled in Supabase, user is auto-logged in
              if (data.session) {
                toast.success(`Welcome, ${fullName || "friend"}.`);
                router.replace("/account");
                router.refresh();
              } else {
                // Confirmation required — tell them to check inbox but ALSO let them try sign-in
                toast.success("Account created. You can sign in now.");
                router.push("/auth/login");
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Order updates and receipts will go here.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link href="/auth/login" className="font-medium text-foreground hover:underline">
                Sign in
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
              Skip signup — check out as a guest. Order updates still come to your email.
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
