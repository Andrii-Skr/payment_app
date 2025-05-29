// lib/hooks/useToggleDelete.ts
"use client";

import { useCallback } from "react";
import { toast } from "@/lib/hooks/use-toast";

type Params = {
  apiFn: (id: number, isDeleted: boolean) => Promise<any>;
  mutateFn: (id: number, isDeleted: boolean) => void;
  getEntityState: (id: number) => boolean;
  messages?: {
    delete?: string;
    restore?: string;
    error?: string;
  };
};

export function useToggleDelete({
  apiFn,
  mutateFn,
  getEntityState,
  messages = {},
}: Params) {
  return useCallback(
    async (id: number) => {
      const isCurrentlyDeleted = getEntityState(id);
      const newState = !isCurrentlyDeleted;

      try {
        await apiFn(id, newState);
        mutateFn(id, newState);
        toast.success(newState ? messages.delete ?? "Удалено" : messages.restore ?? "Восстановлено");
      } catch (e) {
        toast.error(messages.error ?? "Ошибка при обновлении");
      }
    },
    [apiFn, mutateFn, getEntityState, messages]
  );
}
