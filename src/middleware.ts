import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if(pathname === "/" && token?.role === "USER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }else if(pathname === "/" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }else if(pathname === "/" && token?.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer", req.url));
    }else if(pathname === "/" && !token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    
    if (token?.role === "ADMIN" && pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
    if (token?.role === "CUSTOMER" && pathname.startsWith("/customer")) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.next(); 
    }


    return NextResponse.redirect(new URL("/unauthorized", req.url));
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, 
    },
    pages: {
      signIn: "/signin", // ← THIS IS THE KEY LINE
    },
  }
);

export const config = {
  matcher: ["/","/dashboard/:path*", "/admin/:path*", "/moderator/:path*"],
};