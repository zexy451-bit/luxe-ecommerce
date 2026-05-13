import { createClient } from "@/lib/supabase/server";
import { CouponManager } from "@/components/admin/coupon-manager";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  const { data: promotions } = await supabase.from("promotions").select("*").order("ends_at");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-light">Discounts</h1>
        <p className="text-sm text-muted-foreground">Coupons and scheduled promotions</p>
      </div>
      <CouponManager coupons={coupons || []} promotions={promotions || []} />
    </div>
  );
}
