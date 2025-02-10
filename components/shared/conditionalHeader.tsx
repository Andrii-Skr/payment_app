"use client";

import { usePathname } from "next/navigation";
import { Header } from "../header";

export const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/auth/signin", "/auth/register"];

  if (hideHeaderRoutes.includes(pathname)) return null;
  return <Header />;
};
