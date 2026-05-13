import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Package, MapPin, Heart, User } from "lucide-react";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const links = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  ];
  return (
    <div className="container-wide py-12">
      <h1 className="heading-display mb-8 text-4xl font-light">My account</h1>
      <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
