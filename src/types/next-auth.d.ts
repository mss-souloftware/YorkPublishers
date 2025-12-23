import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "USER" | "CUSTOMER";
  }

  interface Session {
    user: {
      id: string; // we add id too, it's useful and safe
      role: "ADMIN" | "USER" | "CUSTOMER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "USER" | "CUSTOMER";
  }
}