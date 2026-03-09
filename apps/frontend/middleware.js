import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/client", "/company"];

export function middleware(request) {
  const token = request.cookies.get("crms_token")?.value;
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/client/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/client/:path*", "/company/:path*"],
};
