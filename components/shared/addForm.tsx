"use client";
import type { entity } from "@prisma/client";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";

export const AddForm: React.FC = () => {
  const [entityList, setEntityList] = useState<entity[] | undefined>([]);

  useEffect(() => {
    apiClient.entities.getAll().then((data) => {
      if (data) setEntityList(data);
    });
  }, []);

  return (
    <div>
      {entityList?.map((e) => {
        return (
          <div key={e.id} className="flex gap-5">
            <div>{e.id}</div> <div>{e.short_name}</div> <div>{e.edrpou}</div> <div>{e.is_deleted}</div>{" "}
            <div>{e.created_at ? <span>{e.created_at.toLocaleString()}</span> : null}</div>
            <div>{e.created_at ? <span>{e.created_at.toLocaleString()}</span> : null}</div>
          </div>
        );
      })}
    </div>
  );
};
