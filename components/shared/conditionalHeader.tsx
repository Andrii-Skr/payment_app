"use client";

import { usePathname } from "next/navigation";
import { stripLocaleFromPathname } from "@/lib/i18n/locales";
import { Header } from "../header";

export const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  const pathWithoutLocale = stripLocaleFromPathname(pathname);
  const hideHeaderRoutes = ["/auth/signin", "/auth/register"];

  if (hideHeaderRoutes.includes(pathWithoutLocale)) return null;
  return <Header />;
};
