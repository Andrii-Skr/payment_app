"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import { entity } from "@prisma/client";


type Props = {
  className?: string;
};
// type TempData = {
//   id: number;
//   name: string;
// };

// const tempData: TempData[] = [
//   {
//     id: 1,
//     name: "Выбор",
//   },
//   {
//     id: 2,
//     name: "Зенит",
//   },
//   {
//     id: 3,
//     name: "Аврора",
//   },
//   {
//     id: 4,
//     name: "Арпи",
//   },
// ];
export const EntityLIst: React.FC<Props> = ({ className }) => {
  const [entityList, setEntityList] = useState<entity[] | undefined>([]);
  const router = useRouter();

  const handleClick = () => {
    router.push("/create/payment-form");
  };

  useEffect(() => {
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
            onClick={handleClick}
          >
            <FilePlus2 />
            <span className="flex-grow text-center">{e.name}</span>
          </Button>
        );
      })}
    </div>
  );
};
