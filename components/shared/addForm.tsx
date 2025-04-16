"use client";
import { apiClient } from "@/services/api-client";
import { entity } from "@prisma/client";
import { useEffect, useState } from "react";


type Props = {};

export const AddForm:React.FC<Props> = () => {
  const [entityList, setEntityList] = useState<entity[] | undefined>([]);

  useEffect(() => {
    apiClient.entity.entityService().then((data) => {
      setEntityList(data);
    });
  }, []);

  return (
    <div>
      {entityList?.map((e) => {
        return (
          <div key={e.id} className="flex gap-5">
            <div>{e.id}</div> <div>{e.name}</div> <div>{e.edrpou}</div>{" "}
            <div>{e.is_deleted}</div>{" "}
            <div>
              {e.created_at ? (
                <span>{e.created_at.toLocaleString()}</span>
              ) : null}
            </div>
            <div>
              {e.created_at ? (
                <span>{e.created_at.toLocaleString()}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};


