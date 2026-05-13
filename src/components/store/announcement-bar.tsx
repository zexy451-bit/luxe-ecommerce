import { createClient } from "@/lib/supabase/server";

export async function AnnouncementBar() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("announcement_text, announcement_enabled")
    .single();

  if (!data?.announcement_enabled || !data.announcement_text) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-wide py-2 text-center text-[11px] uppercase tracking-[0.18em]">
        {data.announcement_text}
      </div>
    </div>
  );
}
