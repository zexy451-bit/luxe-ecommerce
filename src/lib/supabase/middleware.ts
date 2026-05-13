import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet: CookieToSet[]) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isAccountRoute = url.pathname.startsWith("/account");
  const isAuthRoute = url.pathname.startsWith("/auth");

  if ((isAdminRoute || isAccountRoute) && !user) {
    const redirect = url.clone();
    redirect.pathname = "/auth/login";
    redirect.searchParams.set("next", url.pathname);
    return NextResponse.redirect(redirect);
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      const redirect = url.clone();
      redirect.pathname = "/";
      return NextResponse.redirect(redirect);
    }
  }

  // Allow authenticated users to access /auth/callback (for OAuth + recovery) and
  // /auth/reset-password (active recovery session sets a new password).
  const allowAuthedOnAuthPath =
    url.pathname.startsWith("/auth/callback") ||
    url.pathname.startsWith("/auth/reset-password");

  if (isAuthRoute && user && !allowAuthedOnAuthPath) {
    const redirect = url.clone();
    redirect.pathname = "/account";
    return NextResponse.redirect(redirect);
  }

  return response;
}
