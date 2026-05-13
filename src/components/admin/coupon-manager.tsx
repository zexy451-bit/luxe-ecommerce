"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Coupon } from "@/types/db";

export function CouponManager({
  coupons, promotions,
}: { coupons: Coupon[]; promotions: any[] }) {
  return (
    <Tabs defaultValue="coupons">
      <TabsList>
        <TabsTrigger value="coupons">Coupons</TabsTrigger>
        <TabsTrigger value="promotions">Promotions</TabsTrigger>
      </TabsList>
      <TabsContent value="coupons"><CouponsTab list={coupons} /></TabsContent>
      <TabsContent value="promotions"><PromosTab list={promotions} /></TabsContent>
    </Tabs>
  );
}

function CouponsTab({ list }: { list: Coupon[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");

  const create = async () => {
    if (!code || !value) return toast.error("Code and value required");
    const { error } = await supabase.from("coupons").insert({
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      min_order_amount: minOrder ? parseFloat(minOrder) : 0,
      is_active: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Coupon created");
      setCode(""); setValue(""); setMinOrder("");
      router.refresh();
    }
  };

  const toggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    router.refresh();
  };
  const remove = async (c: Coupon) => {
    if (!confirm(`Delete ${c.code}?`)) return;
    await supabase.from("coupons").delete().eq("id", c.id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 font-medium">Create coupon</h3>
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-1.5"><Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" />
          </div>
          <div className="space-y-1.5"><Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "percentage" | "fixed")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">% Percentage</SelectItem>
                <SelectItem value="fixed">$ Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Value</Label>
            <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label>Min order</Label>
            <Input type="number" step="0.01" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
          </div>
          <div className="flex items-end"><Button onClick={create}>Create</Button></div>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min order</th>
                <th>Used</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-6 py-3 font-mono">{c.code}</td>
                  <td>{c.type}</td>
                  <td>{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</td>
                  <td>{c.min_order_amount ? `$${c.min_order_amount}` : "—"}</td>
                  <td>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                  <td>
                    <Switch checked={c.is_active} onCheckedChange={() => toggle(c)} />
                  </td>
                  <td>
                    <Button variant="ghost" size="icon" onClick={() => remove(c)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PromosTab({ list }: { list: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");

  const create = async () => {
    if (!title || !startsAt || !endsAt || !value) return toast.error("All fields required");
    const { error } = await supabase.from("promotions").insert({
      title, starts_at: startsAt, ends_at: endsAt,
      discount_type: type, discount_value: parseFloat(value), is_active: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Promotion created");
      setTitle(""); setStartsAt(""); setEndsAt(""); setValue("");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 font-medium">Schedule a promotion</h3>
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-1.5 sm:col-span-2"><Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label>Starts</Label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label>Ends</Label>
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
          <div className="flex items-end"><Button onClick={create}>Schedule</Button></div>
        </div>
      </Card>
      <div className="space-y-3">
        {list.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.starts_at)} → {formatDate(p.ends_at)}
                </p>
              </div>
              <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Off"}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
