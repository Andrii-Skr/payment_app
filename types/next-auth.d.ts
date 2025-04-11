import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      login: string;
      role: string;
    };
  }

  interface User {
    id: string;
    name?: string;
    login: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string;
    login: string;
    role: string;
  }
}
