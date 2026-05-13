"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { ShippingSettings } from "@/types/db";

export function ShippingSettingsForm({ initial }: { initial: ShippingSettings }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-medium">Shipping charges</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Flat rate">
          <Input type="number" step="0.01" value={s.flat_rate} onChange={(e) => setS({ ...s, flat_rate: parseFloat(e.target.value) })} />
        </Field>
        <Field label="Free shipping above">
          <Input type="number" step="0.01" value={s.free_shipping_threshold} onChange={(e) => setS({ ...s, free_shipping_threshold: parseFloat(e.target.value) })} />
        </Field>
      </div>
      <h3 className="font-medium pt-4">Tax</h3>
      <Field label="Tax rate (e.g. 0.07 = 7%)">
        <Input type="number" step="0.0001" value={s.tax_rate} onChange={(e) => setS({ ...s, tax_rate: parseFloat(e.target.value) })} />
      </Field>
      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const supabase = createClient();
          const { error } = await supabase
            .from("shipping_settings")
            .update({ ...s, updated_at: new Date().toISOString() })
            .eq("id", true);
          setSaving(false);
          if (error) toast.error(error.message);
          else toast.success("Shipping settings saved");
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
