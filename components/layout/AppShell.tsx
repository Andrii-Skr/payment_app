// components/layout/AppShell.tsx
"use client";

import React from "react";
import SessionProvider from "@/components/providers/SessionProvider";
import SessionHeartbeat from "@/components/providers/SessionHeartbeat";
import { ConditionalHeader } from "@/components/shared";
import { Toaster } from "@/components/ui/toaster";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SessionProvider>
      <SessionHeartbeat />
      <ConditionalHeader />
      {children}
      <Toaster />
    </SessionProvider>
  );
};
