import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth_session");
  const { pathname } = request.nextUrl;

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!authSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if session is expired
  const expiresAt = parseInt(authSession.value);
  if (Date.now() > expiresAt) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
