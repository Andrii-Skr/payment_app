"use client";

import { EntityTable } from "@/components/shared";
import { apiClient } from "@/services/api-client";
import React from "react";
import { EntityWithAll } from "@/app/api/(v1)/(protected)/documents/entities/route";

type Props = {
  className?: string;
};

export const PaymentSchedule: React.FC<Props> = ({ className }) => {
  const [entities, setEntities] = React.useState<EntityWithAll[]>([]);

  const fetchEntities = async () => {
    const data = await apiClient.documents.entitySchedule();
    if (!data) return;
    console.log("data", data);
    setEntities(data);
  };

  React.useEffect(() => {
    fetchEntities();
  }, []);

  const mergedDocs = (entities ?? []).flatMap(
    (entity) => entity.documents ?? []
  );
  console.log("mergedDocs", mergedDocs);
  mergedDocs.sort((a, b) => {
    const diff = a.entity_id - b.entity_id;
    if (diff !== 0) return diff;
    return a.partner.full_name.localeCompare(b.partner.full_name);
  });

  const entityNames = (entities ?? []).reduce((acc, entity) => {
    acc[entity.id] = entity.short_name ?? entity.full_name
    return acc;
  }, {} as Record<number, string>);

  return (
    <main className="flex-1">
      <EntityTable
        documents={mergedDocs}
        entityNames={entityNames}
        reloadDocuments={fetchEntities}
      />
    </main>
  );
};
