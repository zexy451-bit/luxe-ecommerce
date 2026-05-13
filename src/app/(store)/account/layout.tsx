import Link from "next/link";
import { requireUser, getProfile } from "@/lib/auth";
import { Package, MapPin, Heart, User } from "lucide-react";
import { SignOutButton } from "@/components/store/sign-out-button";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const profile = await getProfile();
  const links = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  ];
  return (
    <div className="container-wide py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-display text-4xl font-light">My account</h1>
          {profile?.email && (
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{profile.email}</span>
            </p>
          )}
        </div>
        <div className="hidden sm:block">
          <SignOutButton variant="button" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
        <nav className="flex flex-col gap-1">
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
          <div className="mt-4 border-t pt-4">
            <SignOutButton variant="button" />
          </div>
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
