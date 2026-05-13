"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setTimeout(() => {
          toast.success("You're on the list.");
          setEmail("");
          setLoading(false);
        }, 600);
      }}
      className="flex gap-2"
    >
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>Join</Button>
    </form>
  );
}
