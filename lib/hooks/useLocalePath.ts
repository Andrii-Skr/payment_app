"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { type AppLocale, DEFAULT_LOCALE, getLocaleFromPathname, localizePath } from "@/lib/i18n/locales";

export function useLocalePath() {
  const pathname = usePathname();
  const locale = (getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE) as AppLocale;
  const withLocale = useCallback((path: string) => localizePath(path, locale), [locale]);

  return {
    locale,
    withLocale,
  };
}
