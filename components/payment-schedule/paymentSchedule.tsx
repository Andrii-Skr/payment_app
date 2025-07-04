"use client";

import { EntityTable } from "@/components/shared";
import { apiClient } from "@/services/api-client";
import React from "react";
import { EntityWithAll } from "@/app/api/(v1)/(protected)/documents/entities/route";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";

type Props = {
  className?: string;
};

export const PaymentSchedule: React.FC<Props> = ({ className }) => {
  const [entities, setEntities] = React.useState<EntityWithAll[]>([]);
  const { syncWithDocuments } = usePendingPayments();

  const fetchEntities = async () => {
    const data = await apiClient.documents.entitySchedule();

    if (data) {
      syncWithDocuments(data.flatMap((e) => e.documents));
      setEntities(data);
    }
  };

  React.useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <main className="flex-1">
      <EntityTable
        entities={entities}
        reloadDocuments={fetchEntities}
      />
    </main>
  );
};
