// components/layout/AppShell.tsx
"use client";

import type React from "react";
import ReactGrabProvider from "@/components/providers/ReactGrabProvider";
import SessionHeartbeat from "@/components/providers/SessionHeartbeat";
import SessionProvider from "@/components/providers/SessionProvider";
import { ConditionalHeader } from "@/components/shared";
import { Toaster } from "@/components/ui/toaster";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <div className="flex min-h-dvh flex-col">
        <ReactGrabProvider />
        <SessionHeartbeat />
        <ConditionalHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <Toaster />
      </div>
    </SessionProvider>
  );
};
