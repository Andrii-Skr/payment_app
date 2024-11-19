"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
};
type TempData = {
  id: number;
  name: string;
};

const tempData: TempData[] = [
  {
    id: 1,
    name: "Юр Лицо",
  },
  {
    id: 2,
    name: "Контрагент",
  },
];
export const AddInfoList: React.FC<Props> = ({ className }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/add/add-form");
  };

  return (
    <div className={cn("flex flex-col max-w-60", className)}>
      {tempData.map((e) => {
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
