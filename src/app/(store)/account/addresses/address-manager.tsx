"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Address } from "@/types/db";

export function AddressManager({ initial, userId }: { initial: Address[]; userId: string }) {
  const [list, setList] = useState<Address[]>(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "US",
  });

  const supabase = createClient();

  const setDefault = async (id: string) => {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setList((l) => l.map((a) => ({ ...a, is_default: a.id === id })));
  };
  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setList((l) => l.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      {list.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium">{a.full_name} {a.is_default && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-800">Default</span>}</p>
              <p className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
              <p className="text-muted-foreground">{a.city}, {a.state} {a.postal_code}, {a.country}</p>
              <p className="text-muted-foreground">{a.phone}</p>
            </div>
            <div className="flex gap-2">
              {!a.is_default && (
                <Button size="sm" variant="outline" onClick={() => setDefault(a.id)}>
                  Set default
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {!adding && (
        <Button variant="outline" onClick={() => setAdding(true)}>+ Add address</Button>
      )}

      {adding && (
        <form
          className="space-y-3 rounded-xl border p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const { data, error } = await supabase
              .from("addresses")
              .insert({ ...form, user_id: userId, is_default: list.length === 0 })
              .select("*")
              .single();
            if (error) return toast.error(error.message);
            if (data) {
              setList([...list, data]);
              setAdding(false);
              setForm({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "US" });
              toast.success("Address saved");
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {(["full_name","phone","line1","line2","city","state","postal_code","country"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label>{k.replace("_"," ")}</Label>
                <Input
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  required={k !== "line2"}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
