"use client";

import { EntityTable } from "@/components/shared";
import { apiClient } from "@/services/api-client";
import React from "react";
import { EntityType } from "../../types/types";

type Props = {
  className?: string;
};

export const PaymentSchedule: React.FC<Props> = ({ className }) => {
  const [entities, setEntities] = React.useState<EntityType[]>([]);

  const fetchEntities = async () => {
    const data = await apiClient.entity.entitySchedule();
    setEntities(data);
  };

  React.useEffect(() => {
    fetchEntities();
  }, []);

  const mergedDocs = (entities ?? []).flatMap((entity) => entity.documents ?? []);
  mergedDocs.sort((a, b) => {
    const diff = a.partners.entity_id - b.partners.entity_id;
    if (diff !== 0) return diff;
    return a.partners.name.localeCompare(b.partners.name);
  });

  const entityNames = (entities ?? []).reduce((acc, entity) => {
    acc[entity.id] = entity.name;
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
