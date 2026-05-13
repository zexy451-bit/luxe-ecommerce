import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">404</p>
      <h1 className="heading-display mt-3 text-5xl font-light">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you're looking for has been moved, removed, or never existed.
      </p>
      <Button asChild className="mt-8"><Link href="/">Return home</Link></Button>
    </div>
  );
}
