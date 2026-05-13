import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { AddressManager } from "./address-manager";
import type { Address } from "@/types/db";

export default async function AddressesPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <Card className="p-6">
      <h2 className="mb-6 font-medium">Saved addresses</h2>
      <AddressManager initial={(addresses || []) as Address[]} userId={user.id} />
    </Card>
  );
}
