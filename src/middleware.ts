import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Check if required environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables not found, skipping auth middleware",
    );
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth session error:", error);
    }

    // Define public routes that don't require authentication
    const publicRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password"];

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(
      (route) =>
        req.nextUrl.pathname === route ||
        req.nextUrl.pathname.startsWith(route + "/"),
    );

    // If user is not authenticated and trying to access a protected route
    if (!session && !isPublicRoute) {
      // Redirect to sign-in page
      const signInUrl = new URL("/sign-in", req.url);
      // Add the original URL as a redirect parameter so user can be redirected back after sign-in
      signInUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      session &&
      (req.nextUrl.pathname === "/sign-in" ||
        req.nextUrl.pathname === "/sign-up")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  return response;
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
