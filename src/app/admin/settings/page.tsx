import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";
import { HomepageSectionsManager } from "@/components/admin/homepage-sections-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [store, payment, shipping, slides, sections] = await Promise.all([
    supabase.from("store_settings").select("*").single(),
    supabase.from("payment_settings").select("*").single(),
    supabase.from("shipping_settings").select("*").single(),
    supabase.from("hero_slides").select("*").order("display_order"),
    supabase.from("homepage_sections").select("*").order("display_order"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-light">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage store-wide configuration</p>
      </div>
      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="content">Homepage</TabsTrigger>
        </TabsList>
        <TabsContent value="store"><StoreSettingsForm initial={store.data!} /></TabsContent>
        <TabsContent value="payment"><PaymentSettingsForm initial={payment.data!} /></TabsContent>
        <TabsContent value="shipping"><ShippingSettingsForm initial={shipping.data!} /></TabsContent>
        <TabsContent value="content">
          <div className="space-y-6">
            <HeroSlidesManager initial={slides.data || []} />
            <HomepageSectionsManager initial={sections.data || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
