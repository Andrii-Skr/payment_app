import { Role } from "@/constants/roles";

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      login: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string;
    login: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string;
    login: string;
    role: Role;
  }
}
