'use client';

import { useSessionRefresh } from "@/lib/hooks/useSessionRefresh";

export default function SessionHeartbeat() {
  useSessionRefresh();
  return null;
}
