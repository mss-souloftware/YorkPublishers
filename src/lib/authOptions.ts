import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./auth";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true,
            profile: {
              select: { profileImage: true },
            },
          },
        });

        if (!user) return null;

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) return null;

        console.log(user);
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name ?? null,
          role: user.role.name as "ADMIN" | "USER" | "CUSTOMER",
          profileImage: user.profile?.profileImage ?? null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileImage = user.profileImage; 
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER" | "CUSTOMER";
        session.user.profileImage = token.profileImage as string | null; 
      }
      return session;
    },

    async signIn({ user }) {
      if (user?.id) {
        const userId = Number(user.id);

        try {
          await prisma.userActivity.create({
            data: {
              userId,
              action: "Logged in",
              details: "User signed in with email/password",
            },
          });
        } catch (error) {
          console.error("Failed to log login activity:", error);
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/signin",
  },
};