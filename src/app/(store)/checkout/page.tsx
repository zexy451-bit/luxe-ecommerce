import { createClient } from "@/lib/supabase/server";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const [paymentRes, shippingRes, userRes] = await Promise.all([
    supabase.from("payment_settings").select("*").single(),
    supabase.from("shipping_settings").select("*").single(),
    supabase.auth.getUser(),
  ]);

  let defaultAddress = null;
  if (userRes.data.user) {
    const { data: addr } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userRes.data.user.id)
      .eq("is_default", true)
      .maybeSingle();
    defaultAddress = addr;
  }

  return (
    <CheckoutClient
      payment={paymentRes.data!}
      shipping={shippingRes.data!}
      user={userRes.data.user ? { id: userRes.data.user.id, email: userRes.data.user.email! } : null}
      defaultAddress={defaultAddress}
    />
  );
}
