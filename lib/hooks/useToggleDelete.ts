"use client";

import { useCallback } from "react";
import { toast } from "@/lib/hooks/use-toast";

type Params = {
  apiFn: (id: number, isDeleted: boolean, entityId: number) => Promise<any>;
  mutateFn: (id: number, isDeleted: boolean, entityId: number) => void;
  getEntityState: (id: number, entityId: number) => boolean;
  messages?: {
    delete?: string;
    restore?: string;
    error?: string;
  };
};

export function useToggleDelete({ apiFn, mutateFn, getEntityState, messages = {} }: Params) {
  return useCallback(
    async (id: number, entityId: number) => {
      const isCurrentlyDeleted = getEntityState(id, entityId);
      const newState = !isCurrentlyDeleted;

      try {
        await apiFn(id, newState, entityId);
        mutateFn(id, newState, entityId);
        toast.success(newState ? (messages.delete ?? "Удалено") : (messages.restore ?? "Восстановлено"));
      } catch {
        toast.error(messages.error ?? "Ошибка при обновлении");
      }
    },
    [apiFn, mutateFn, getEntityState, messages],
  );
}
