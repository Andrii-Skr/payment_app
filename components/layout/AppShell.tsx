// components/layout/AppShell.tsx
"use client";

import type React from "react";
import SessionHeartbeat from "@/components/providers/SessionHeartbeat";
import SessionProvider from "@/components/providers/SessionProvider";
import { ConditionalHeader } from "@/components/shared";
import { Toaster } from "@/components/ui/toaster";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <SessionHeartbeat />
      <ConditionalHeader />
      {children}
      <Toaster />
    </SessionProvider>
  );
};
