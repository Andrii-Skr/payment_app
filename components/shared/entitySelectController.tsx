"use client";

import type { entity } from "@prisma/client";
import { useEffect, useState } from "react";
import { ComboboxUniversal } from "@/components/ui/";
import { apiClient } from "@/services/api-client";

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
        className="w-[300px]"
        placeholder="Выберите Юрлицо"
      />
      {children(selectedId, entities)}
    </div>
  );
};
