"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { entity } from "@prisma/client";
import { useEntityStore } from "@/store/store";
import React from "react";


type Props = {
  className?: string;
};

export const EntityLIst: React.FC<Props> = ({ className }) => {
  const [entityList, setEntityList] = React.useState<entity[] | undefined>([]);
  const updateCurrentEntity = useEntityStore((state ) => state.updateCurrentEntity)
  const router = useRouter();

  const handleClick = (entity: entity) => {
    router.push("/create/payment-form");
    updateCurrentEntity(entity);
  };

  React.useEffect(() => {
    apiClient.entity.entityService().then((data) => {
      setEntityList(data);
    });
  }, []);

  return (
    <div className={cn("flex flex-col max-w-60", className)}>
      {entityList?.map((e) => {
        return (
          <Button
            variant="outline"
            key={e.id}
            className={cn("flex items-center", className)}
            onClick={() => handleClick(e)}
          >
            <FilePlus2 />
            <span className="flex-grow text-center">{e.name}</span>
          </Button>
        );
      })}
    </div>
  );
};
