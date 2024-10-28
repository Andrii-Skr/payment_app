'use client'

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { FilePlus2, SquareArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
};
type TtempData = {
  id: number;
  name: string;
};

const tempData: TtempData[] = [
  {
    id: 1,
    name: "Выбор",
  },
  {
    id: 2,
    name: "Зенит",
  },
  {
    id: 3,
    name: "Аврора",
  },
  {
    id: 4,
    name: "Арпи",
  },
];
export const EntityLIst: React.FC<Props> = ({ className }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push("/create/payment-form");
  };

  return (
    <div className={cn("flex flex-col max-w-60", className)}>
      {tempData.map((e) => {
        return (
            <Button variant="outline" key={e.id} className={cn("flex items-center" ,className)} onClick={handleClick}>
              <FilePlus2 />
              <span className="flex-grow text-center">{e.name}</span>
            </Button>
        );
      })}
    </div>
  );
};
