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

  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="w-[400px] max-w-full p-8">
          <div className="mb-6 text-center">
            <h1 className="heading-display text-3xl font-light">Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll send you a link to set a new password.
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const supabase = createClient();
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
              });
              setLoading(false);
              if (error) return toast.error(error.message);
              toast.success("Check your inbox for the reset link.");
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
        </Card>
      </motion.div>
    </div>
  );
}
