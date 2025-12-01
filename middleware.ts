// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { withAuth } from "next-auth/middleware";
import { hasRole } from "@/lib/access/hasRole";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const adminOnlyPaths = ["/admin", "/regular", "/add"];
    const isAdminOnly = adminOnlyPaths.some((p) => pathname.startsWith(p));

    if (isAdminOnly && !hasRole(token?.role, "admin")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/auth/signin" },
    callbacks: { authorized: ({ token }) => !!token },
  },
);

// 💡 Авторизацию пускаем на весь сайт (кроме явных исключений)
export const config = {
  matcher: ["/((?!auth/signin|auth/register|api/log-test|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
