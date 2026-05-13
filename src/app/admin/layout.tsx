import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("store_name")
    .single();
  const storeName = settings?.store_name || "Luxe";
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px,1fr]">
        <AdminSidebar storeName={storeName} />
        <div className="flex flex-col">
          <AdminHeader email={profile.email} name={profile.full_name} />
          <main className="flex-1 p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
