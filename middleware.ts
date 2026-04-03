import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { withAuth } from "next-auth/middleware";
import { hasRole } from "@/lib/access/hasRole";
import { DEFAULT_LOCALE, getLocaleFromPathname, localizePath, stripLocaleFromPathname } from "@/lib/i18n/locales";

const PUBLIC_PATHS = ["/auth/signin", "/auth/register"];
const ADMIN_ONLY_PATHS = ["/regular", "/add"];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const localeFromPath = getLocaleFromPathname(pathname);
    const locale = localeFromPath ?? DEFAULT_LOCALE;
    const pathWithoutLocale = stripLocaleFromPathname(pathname);
    const token = req.nextauth.token;

    if (!localeFromPath) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = localizePath(pathname, locale);
      return NextResponse.redirect(redirectUrl);
    }

    const isAdminOnly = ADMIN_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p));

    if (isAdminOnly && !hasRole(token?.role, "admin")) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = localizePath("/unauthorized", locale);
      return NextResponse.redirect(redirectUrl);
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-locale", locale);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    pages: { signIn: localizePath("/auth/signin", DEFAULT_LOCALE) },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathWithoutLocale = stripLocaleFromPathname(req.nextUrl.pathname);
        if (PUBLIC_PATHS.includes(pathWithoutLocale)) {
          return true;
        }
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!api/auth|api|_next/static|_next/image|favicon.ico).*)"],
};
