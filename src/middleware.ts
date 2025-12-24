// middleware.ts (or src/middleware.ts)

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

  
    if (pathname === "/") {
      if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
      }

      if (token.role === "ADMIN" || token.role === "USER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (token.role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }


    if (token) {
      if (token.role === "ADMIN" && pathname.startsWith("/admin")) {
        return NextResponse.next();
      }
      if (token.role === "CUSTOMER" && pathname.startsWith("/customer")) {
        return NextResponse.next();
      }
      if (pathname.startsWith("/dashboard")) {
        return NextResponse.next();
      }
    }

    // Everything else: unauthorized
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, 
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/customer/:path*", 
  ],
};