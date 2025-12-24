import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Allow auth pages
  if (pathname === "/signin" || pathname === "/unauthorized") {
    return NextResponse.next();
  }

  // Root
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Role-based protection
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/customer") && token.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/customer/:path*",
  ],
};
