"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Section {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  is_enabled: boolean;
}

export function HomepageSectionsManager({ initial }: { initial: Section[] }) {
  const [list, setList] = useState(initial);
  const supabase = createClient();

  const save = async (s: Section) => {
    const { error } = await supabase
      .from("homepage_sections")
      .update({ title: s.title, subtitle: s.subtitle, is_enabled: s.is_enabled })
      .eq("id", s.id);
    if (error) toast.error(error.message);
    else toast.success("Section saved");
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-medium">Homepage sections</h3>
      {list.map((s, i) => (
        <div key={s.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[120px,1fr,1fr,auto,auto]">
          <div className="flex items-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {s.key}
          </div>
          <Input value={s.title} onChange={(e) => {
            const next = [...list]; next[i] = { ...s, title: e.target.value }; setList(next);
          }} />
          <Input
            placeholder="Subtitle"
            value={s.subtitle || ""}
            onChange={(e) => {
              const next = [...list]; next[i] = { ...s, subtitle: e.target.value }; setList(next);
            }}
          />
          <div className="flex items-center gap-2">
            <Switch checked={s.is_enabled} onCheckedChange={(v) => {
              const next = [...list]; next[i] = { ...s, is_enabled: v }; setList(next);
            }} />
            <span className="text-xs text-muted-foreground">Show</span>
          </div>
          <Button size="sm" onClick={() => save(list[i])}>Save</Button>
        </div>
      ))}
    </Card>
  );
}
