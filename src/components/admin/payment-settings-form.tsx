"use client";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { PaymentSettings } from "@/types/db";

export function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const update = <K extends keyof PaymentSettings>(k: K, v: PaymentSettings[K]) => setS({ ...s, [k]: v });

  const uploadQR = async (file: File) => {
    setUploading(true);
    try {
      const path = `qr/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("store").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("store").getPublicUrl(path);
      update("qr_image_url", data.publicUrl);
      toast.success("QR uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-medium">Cash on Delivery</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable COD</span>
        <Switch checked={s.cod_enabled} onCheckedChange={(v) => update("cod_enabled", v)} />
      </div>
      <Field label="COD fee">
        <Input type="number" step="0.01" value={s.cod_fee} onChange={(e) => update("cod_fee", parseFloat(e.target.value))} />
      </Field>

      <h3 className="font-medium pt-4">QR Payment</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable QR payments</span>
        <Switch checked={s.qr_enabled} onCheckedChange={(v) => update("qr_enabled", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[180px,1fr] sm:items-start">
        <div>
          <Label>QR image</Label>
          <div className="mt-1.5 aspect-square w-44 overflow-hidden rounded-lg bg-muted">
            {s.qr_image_url ? (
              <div className="relative h-full w-full">
                <Image src={s.qr_image_url} alt="QR" fill sizes="180px" className="object-contain p-2 bg-white" />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
            )}
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs underline">
            <Upload className="h-3 w-3" /> {uploading ? "Uploading..." : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadQR(e.target.files[0])} />
          </label>
        </div>
        <Field label="Instructions">
          <Textarea rows={5} value={s.qr_instructions || ""} onChange={(e) => update("qr_instructions", e.target.value)} />
        </Field>
      </div>

      <h3 className="font-medium pt-4">Card payments</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable card payments (Stripe / gateway)</span>
        <Switch checked={s.card_enabled} onCheckedChange={(v) => update("card_enabled", v)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Configure the gateway in <code>src/app/api/checkout/route.ts</code>. Toggle ready for future integration.
      </p>

      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const { error } = await supabase
            .from("payment_settings")
            .update({ ...s, updated_at: new Date().toISOString() })
            .eq("id", true);
          setSaving(false);
          if (error) toast.error(error.message);
          else toast.success("Payment settings saved");
        }}
      >
        Save
      </Button>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
