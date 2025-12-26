import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: "ADMIN" | "USER" | "CUSTOMER";
      profileImage: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "USER" | "CUSTOMER";
    profileImage: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "USER" | "CUSTOMER";
    profileImage: string | null;
  }
}