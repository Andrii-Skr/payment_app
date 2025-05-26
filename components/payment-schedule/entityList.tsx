"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { FilePlus2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import { entity } from "@prisma/client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";

type Props = {
  className?: string;
};

function SortableItem({
  e,
  onClick,
  isAdmin,
}: {
  e: entity;
  onClick: (e: entity) => void;
  isAdmin: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: e.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Button
        variant="outline"
        className="flex items-center w-60 mb-2 justify-start"
        onClick={() => onClick(e)}
      >
        {/* drag работает только за иконку */}
        {isAdmin && (
          <span {...attributes} {...listeners} className="mr-2 cursor-move">
            <GripVertical />
          </span>
        )}
        <FilePlus2 className="mr-2" />
        <span className="text-center">{e.short_name}</span>
      </Button>
    </div>
  );
}

export const EntityList: React.FC<Props> = ({ className }) => {
  const [entityList, setEntityList] = useState<entity[]>([]);
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor));

  const { canAccess } = useAccessControl();
  const isAdmin = canAccess(Roles.ADMIN);

  useEffect(() => {
    apiClient.entities.getAll().then((data) => {
      if (data) setEntityList(data);
    });
  }, []);

  const handleClick = (e: entity) => {
    router.push(`/create/payment-form/${e.id}`);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = entityList.findIndex((e) => e.id === active.id);
      const newIndex = entityList.findIndex((e) => e.id === over.id);
      const newList = arrayMove(entityList, oldIndex, newIndex);
      setEntityList(newList);

      const reordered = newList.map((e, index) => ({
        id: e.id,
        sort_order: index + 1,
      }));
      apiClient.entities.reorder(reordered);
    }
  };

  return (
    <div className={cn("flex flex-col max-w-60", className)}>
      {isAdmin ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entityList.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {entityList.map((e) => (
              <SortableItem
                key={e.id}
                e={e}
                onClick={handleClick}
                isAdmin={isAdmin}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        entityList.map((e) => (
          <Button
            variant="outline"
            key={e.id}
            className="flex items-center w-60 mb-2 justify-start"
            onClick={() => handleClick(e)}
          >
            <FilePlus2 className="mr-2" />
            <span className="text-center">{e.short_name}</span>
          </Button>
        ))
      )}
    </div>
  );
};
