"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useLocalePath } from "@/lib/hooks/useLocalePath";
import { logoutAndReset } from "@/lib/utils/logoutAndReset";

export function LogoutDropdown() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { withLocale } = useLocalePath();
  const t = useTranslations("userMenu");

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(withLocale("/auth/signin"));
    }
  }, [status, router, withLocale]);

  if (status === "loading") return null;

  return (
    <div className="absolute top-2 right-5 gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{t("greeting", { name: session?.user?.name ?? t("guest") })}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => logoutAndReset(withLocale("/auth/signin"))} className="text-red-500">
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
