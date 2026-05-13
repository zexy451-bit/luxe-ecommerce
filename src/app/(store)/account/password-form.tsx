"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (password.length < 8) return toast.error("Password must be at least 8 characters");
        if (password !== confirm) return toast.error("Passwords don't match");
        setSaving(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });
        setSaving(false);
        if (error) return toast.error(error.message);
        setPassword("");
        setConfirm("");
        toast.success("Password changed");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>New password</Label>
          <Input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm</Label>
          <Input
            type="password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}
