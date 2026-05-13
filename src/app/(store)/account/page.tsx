import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export default async function AccountOverview() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { count: orderCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-medium">Hello, {profile.full_name || "friend"}</h2>
          <span className="text-xs text-muted-foreground">{profile.email}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          You have placed <span className="font-semibold text-foreground">{orderCount ?? 0}</span> {orderCount === 1 ? "order" : "orders"}.
        </p>
      </Card>
      <Card className="p-6">
        <h2 className="mb-4 font-medium">Profile</h2>
        <ProfileForm initial={profile} />
      </Card>
    </div>
  );
}
