"use client";

import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { DEFAULT_LOCALE, getLocaleFromPathname, localizePath } from "@/lib/i18n/locales";
import { logoutAndReset } from "@/lib/utils/logoutAndReset";

export function useSessionRefresh(intervalMs = 5 * 60 * 1000) {
  useEffect(() => {
    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);

    const interval = setInterval(async () => {
      const inactiveFor = Date.now() - lastActivity;

      const isTabVisible = document.visibilityState === "visible";
      const isUserActive = inactiveFor < intervalMs;

      if (isTabVisible && isUserActive) {
        const session = await getSession();

        if (!session) {
          const locale = getLocaleFromPathname(window.location.pathname) ?? DEFAULT_LOCALE;
          console.log("🔒 Session expired — logging out");
          logoutAndReset(localizePath("/auth/signin", locale));
        } else if (process.env.NODE_ENV === "development") {
          console.log("✅ Session active — refreshed");
        }
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, [intervalMs]);
}
