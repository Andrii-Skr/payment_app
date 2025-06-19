import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { Role } from "@/constants/roles";
import { rateLimit, resetRateLimit } from "@/utils/rateLimiter";
import prisma from "@/prisma/prisma-client";



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip =
          req?.headers?.["x-forwarded-for"] ??
          req?.headers?.["x-real-ip"] ??
          "unknown";

        const login = credentials?.login ?? "unknown";
        const limit = rateLimit(ip.toString(), login);

        if (!limit.allowed) {
          console.warn(`[AUTH RATE LIMIT] ${limit.reason?.toUpperCase()} — ${login} @ ${ip}`);
          return null;
        }

        if (!credentials?.login || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { login: credentials.login },
          include: { role: true },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        resetRateLimit(ip.toString(), login);

        return {
          id: user.id.toString(),
          name: user.name,
          login: user.login,
          role: user.role.name as Role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
    updateAge: 1 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.login = user.login;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          login: token.login,
          role: token.role,
        };
      }
      return session;
    },
  },
};
