'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import { ComboboxUniversal } from "@/components/ui/";
import { entity } from "@prisma/client";

type Props = {
  children: (entityId: number | null, entityList: entity[]) => React.ReactNode;
};

export const EntitySelectController: React.FC<Props> = ({ children }) => {
  const [entities, setEntities] = useState<entity[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    apiClient.entities.getAll().then((list) => {
      setEntities(list);
      if (list.length) setSelectedId(list[0].id);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ComboboxUniversal
        options={entities.map((e) => ({
          value: e.id,
          label: e.short_name,
        }))}
        value={selectedId}
        onChange={setSelectedId}
        placeholder="Выберите юрлицо"
      />
      {children(selectedId, entities)}
    </div>
  );
};
