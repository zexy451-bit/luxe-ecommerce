"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import type { HeroSlide } from "@/types/db";

export function HeroSlidesManager({ initial }: { initial: HeroSlide[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const supabase = createClient();

  const newSlide = async () => {
    const { data } = await supabase.from("hero_slides").insert({
      headline: "New slide", image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800",
      display_order: list.length, is_active: false,
    }).select("*").single();
    if (data) setList([...list, data]);
  };
  const save = async (slide: HeroSlide) => {
    const { error } = await supabase.from("hero_slides").update(slide).eq("id", slide.id);
    if (error) toast.error(error.message);
    else toast.success("Slide saved");
    router.refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete slide?")) return;
    await supabase.from("hero_slides").delete().eq("id", id);
    setList(list.filter((s) => s.id !== id));
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Hero slides</h3>
        <Button size="sm" onClick={newSlide}>Add slide</Button>
      </div>
      <div className="space-y-4">
        {list.map((slide, i) => (
          <SlideEditor
            key={slide.id}
            slide={slide}
            onChange={(s) => {
              const next = [...list]; next[i] = s; setList(next);
            }}
            onSave={() => save(list[i])}
            onRemove={() => remove(slide.id)}
          />
        ))}
      </div>
    </Card>
  );
}

function SlideEditor({
  slide, onChange, onSave, onRemove,
}: {
  slide: HeroSlide;
  onChange: (s: HeroSlide) => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `hero/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("store").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("store").getPublicUrl(path);
      onChange({ ...slide, image_url: data.publicUrl });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="grid gap-4 rounded-xl border p-4 lg:grid-cols-[200px,1fr,auto]">
      <div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
          <Image src={slide.image_url} alt="" fill sizes="200px" className="object-cover" />
        </div>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs underline">
          <Upload className="h-3 w-3" /> {uploading ? "Uploading..." : "Replace"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      <div className="space-y-3">
        <div className="space-y-1"><Label>Headline</Label><Input value={slide.headline} onChange={(e) => onChange({ ...slide, headline: e.target.value })} /></div>
        <div className="space-y-1"><Label>Subheadline</Label><Input value={slide.subheadline || ""} onChange={(e) => onChange({ ...slide, subheadline: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1"><Label>CTA label</Label><Input value={slide.cta_label || ""} onChange={(e) => onChange({ ...slide, cta_label: e.target.value })} /></div>
          <div className="space-y-1"><Label>CTA href</Label><Input value={slide.cta_href || ""} onChange={(e) => onChange({ ...slide, cta_href: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={slide.is_active} onCheckedChange={(v) => onChange({ ...slide, is_active: v })} />
          <span className="text-sm">Visible</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button size="sm" onClick={onSave}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}
