"use client";

import React from "react";
import type { EntityWithAll } from "@/app/api/(v1)/(protected)/documents/entities/route";
import { EntityTable } from "@/components/shared";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";
import { apiClient } from "@/services/api-client";

export const PaymentSchedule: React.FC = () => {
  const [entities, setEntities] = React.useState<EntityWithAll[]>([]);
  const { syncWithDocuments } = usePendingPayments();

  const fetchEntities = React.useCallback(async () => {
    const data = await apiClient.documents.entitySchedule();

    if (data) {
      syncWithDocuments(data.flatMap((e) => e.documents));
      setEntities(data);
    }
  }, [syncWithDocuments]);

  React.useEffect(() => {
    void fetchEntities();
  }, [fetchEntities]);

  return (
    <main className="flex-1">
      <EntityTable entities={entities} reloadDocuments={fetchEntities} />
    </main>
  );
};
