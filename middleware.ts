import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Uruchamia się przy każdym żądaniu: odświeża token sesji Supabase
// i przekierowuje na /login, jeśli ktoś próbuje wejść na chronioną stronę bez logowania.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/clients") ||
    request.nextUrl.pathname.startsWith("/properties") ||
    request.nextUrl.pathname.startsWith("/tasks") ||
    request.nextUrl.pathname.startsWith("/calendar") ||
    request.nextUrl.pathname.startsWith("/contacts") ||
    request.nextUrl.pathname.startsWith("/notes") ||
    request.nextUrl.pathname.startsWith("/matching") ||
    request.nextUrl.pathname.startsWith("/transactions") ||
    request.nextUrl.pathname.startsWith("/api/clients") ||
    request.nextUrl.pathname.startsWith("/api/properties") ||
    request.nextUrl.pathname.startsWith("/api/tasks") ||
    request.nextUrl.pathname.startsWith("/api/events") ||
    request.nextUrl.pathname.startsWith("/api/contacts") ||
    request.nextUrl.pathname.startsWith("/api/notes") ||
    request.nextUrl.pathname.startsWith("/api/transactions");

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/properties/:path*",
    "/tasks/:path*",
    "/calendar/:path*",
    "/api/clients/:path*",
    "/api/properties/:path*",
    "/api/tasks/:path*",
    "/api/events/:path*",
    "/contacts/:path*",
    "/api/contacts/:path*",
    "/notes/:path*",
    "/api/notes/:path*",
    "/matching/:path*",
    "/transactions/:path*",
    "/api/transactions/:path*",
  ],
};