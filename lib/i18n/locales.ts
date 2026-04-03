export const LOCALES = ["ru", "uk", "en"] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "ru";

export function isLocale(value: string | null | undefined): value is AppLocale {
  if (!value) return false;
  return (LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): AppLocale | null {
  const [, firstSegment] = pathname.split("/");
  return isLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";

  const stripped = pathname.slice(`/${locale}`.length) || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function localizePath(pathname: string, locale: AppLocale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withoutLocale = stripLocaleFromPathname(normalized);
  return withoutLocale === "/" ? `/${locale}` : `/${locale}${withoutLocale}`;
}
