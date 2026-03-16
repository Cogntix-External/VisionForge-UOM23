import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/client", "/company"];

function normalizeRole(rawRole) {
  if (!rawRole) return "";
  const role = String(rawRole).trim().toUpperCase();
  if (role === "ROLE_CLIENT") return "CLIENT";
  if (role === "ROLE_COMPANY") return "COMPANY";
  return role;
}

function landingByRole(role) {
  return role === "COMPANY" ? "/company/DashboardSection" : "/client/dashboard";
}

export function middleware(request) {
  const token = request.cookies.get("crms_token")?.value;
  const role = normalizeRole(request.cookies.get("crms_role")?.value);
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname.startsWith("/client") && role === "COMPANY") {
    return NextResponse.redirect(
      new URL("/company/DashboardSection", request.url),
    );
  }

  if (token && pathname.startsWith("/company") && role === "CLIENT") {
    return NextResponse.redirect(new URL("/client/dashboard", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL(landingByRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/client/:path*", "/company/:path*"],
};
