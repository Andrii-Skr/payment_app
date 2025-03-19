"use client";

import { EntityTable } from "@/components/shared";
import { apiClient } from "@/services/api-client";
import React from "react";
import { EntityType } from "../../types";

type Props = {
  className?: string;
};

export const PaymentSchedule: React.FC<Props> = ({ className }) => {
  const [entities, setEntities] = React.useState<EntityType[]>([]);

  React.useEffect(() => {
    apiClient.entity.entitySchedule().then((data) => {
      setEntities(data);
    });
  }, []);

  // Объединяем все документы из всех entities
  const mergedDocs = entities.flatMap((entity) => entity.documents);
  // Сортируем по partner.entity_id (то есть по entity.id) и затем по partner.name
  mergedDocs.sort((a, b) => {
    const diff = a.partners.entity_id - b.partners.entity_id;
    if (diff !== 0) return diff;
    return a.partners.name.localeCompare(b.partners.name);
  });

  // Формируем маппинг entity_id -> entity name
  const entityNames = entities.reduce((acc, entity) => {
    acc[entity.id] = entity.name;
    return acc;
  }, {} as Record<number, string>);

  return (
    <main className="flex-1">
      <EntityTable documents={mergedDocs} entityNames={entityNames} />
    </main>
  );
};
