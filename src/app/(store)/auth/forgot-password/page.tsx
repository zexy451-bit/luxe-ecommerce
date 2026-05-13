"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="w-[420px] max-w-full p-8">
          <div className="mb-6 text-center">
            <h1 className="heading-display text-3xl font-light">Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll email you a secure link to set a new password.
            </p>
          </div>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
                If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
                Check your inbox (and spam folder).
              </p>
              <Link
                href="/auth/login"
                className="inline-block text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const supabase = createClient();
                // The recovery link lands at /auth/callback which exchanges the code for a
                // session, then redirects to next= (the reset-password page).
                const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
                setLoading(false);
                if (error) return toast.error(error.message);
                setSent(true);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                Send reset link
              </Button>
              <p className="text-center text-sm">
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
