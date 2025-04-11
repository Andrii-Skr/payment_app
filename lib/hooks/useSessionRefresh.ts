'use client';

import { useEffect } from "react";
import { getSession, signOut } from "next-auth/react";

export function useSessionRefresh(intervalMs = 5 * 60 * 1000) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const session = await getSession();

      if (!session) {
        console.log("🔒 Session expired — logging out");
        signOut({ callbackUrl: "/auth/signin" });
      } else {
        console.log("✅ Session active");
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
