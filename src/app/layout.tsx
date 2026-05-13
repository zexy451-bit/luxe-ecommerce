import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let storeName = "Luxe";
  let seoTitle: string | null = null;
  let seoDescription: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("store_name, seo_title, seo_description")
      .single();
    if (data?.store_name) storeName = data.store_name;
    seoTitle = data?.seo_title ?? null;
    seoDescription = data?.seo_description ?? null;
  } catch {
    // pre-migration / DB unreachable — fall back to defaults
  }
  return {
    title: {
      default: seoTitle || `${storeName} — Curated essentials`,
      template: `%s | ${storeName}`,
    },
    description: seoDescription || "Curated luxury essentials. Cashmere, leather, tailoring.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    openGraph: { type: "website", siteName: storeName },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
