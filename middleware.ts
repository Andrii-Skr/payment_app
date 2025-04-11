import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { hasRole } from "@/lib/access/hasRole"; // 👈 импорт утилиты

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const adminOnlyPaths = ["/admin", "/regular", "/add"];

    const isAdminOnly = adminOnlyPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isAdminOnly && !hasRole(token?.role, "admin")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next(); // ✅ обязательно
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!auth/signin|auth/register|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
