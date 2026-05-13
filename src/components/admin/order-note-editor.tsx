"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function OrderNoteEditor({ orderId, initial }: { orderId: string; initial: string | null }) {
  const [note, setNote] = useState(initial || "");
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-2">
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the team..." />
      <Button
        size="sm"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const supabase = createClient();
          const { error } = await supabase
            .from("orders")
            .update({ admin_note: note || null })
            .eq("id", orderId);
          setSaving(false);
          if (error) toast.error(error.message);
          else toast.success("Note saved");
        }}
      >
        Save note
      </Button>
    </div>
  );
}
