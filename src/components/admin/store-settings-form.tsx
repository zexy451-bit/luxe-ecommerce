"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { StoreSettings } from "@/types/db";

export function StoreSettingsForm({ initial }: { initial: StoreSettings }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const update = (k: keyof StoreSettings, v: unknown) => setS({ ...s, [k]: v });

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-medium">Brand</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name"><Input value={s.store_name} onChange={(e) => update("store_name", e.target.value)} /></Field>
        <Field label="Currency"><Input value={s.currency} onChange={(e) => update("currency", e.target.value)} /></Field>
        <Field label="Email"><Input value={s.store_email} onChange={(e) => update("store_email", e.target.value)} /></Field>
        <Field label="Phone"><Input value={s.store_phone} onChange={(e) => update("store_phone", e.target.value)} /></Field>
      </div>
      <Field label="Address"><Textarea value={s.store_address} onChange={(e) => update("store_address", e.target.value)} /></Field>

      <h3 className="font-medium pt-4">Announcement bar</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm">Show announcement bar</span>
        <Switch checked={s.announcement_enabled} onCheckedChange={(v) => update("announcement_enabled", v)} />
      </div>
      <Field label="Text"><Input value={s.announcement_text || ""} onChange={(e) => update("announcement_text", e.target.value)} /></Field>

      <h3 className="font-medium pt-4">Social links</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Instagram"><Input value={s.social_instagram || ""} onChange={(e) => update("social_instagram", e.target.value)} /></Field>
        <Field label="Facebook"><Input value={s.social_facebook || ""} onChange={(e) => update("social_facebook", e.target.value)} /></Field>
        <Field label="Twitter / X"><Input value={s.social_twitter || ""} onChange={(e) => update("social_twitter", e.target.value)} /></Field>
      </div>

      <h3 className="font-medium pt-4">SEO</h3>
      <Field label="Site title"><Input value={s.seo_title || ""} onChange={(e) => update("seo_title", e.target.value)} /></Field>
      <Field label="Meta description"><Textarea value={s.seo_description || ""} onChange={(e) => update("seo_description", e.target.value)} /></Field>

      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const supabase = createClient();
          const { error } = await supabase
            .from("store_settings")
            .update({ ...s, updated_at: new Date().toISOString() })
            .eq("id", true);
          setSaving(false);
          if (error) toast.error(error.message);
          else toast.success("Settings saved");
        }}
      >
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
