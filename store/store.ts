import type { entity } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type entityState = {
  currentEntity?: entity;
};

type entityAction = {
  updateCurrentEntity: (entity: entityState["currentEntity"]) => void;
};
type PersistedEntityState = entityState & entityAction;

export const useEntityStore = create(
  persist<PersistedEntityState>(
    (set) => ({
      currentEntity: undefined,
      updateCurrentEntity: (entity) => set({ currentEntity: entity }),
    }),
    {
      name: "entity-storage",
    },
  ),
);

// -----------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------

interface EntityStore {
  expandedEntities: number[];
  toggleEntity: (id: number) => void;
}

export const useEntityScheduleStore = create<EntityStore>((set) => ({
  expandedEntities: [],
  toggleEntity: (id: number) =>
    set((state) => ({
      expandedEntities: state.expandedEntities.includes(id)
        ? state.expandedEntities.filter((eid) => eid !== id)
        : [...state.expandedEntities, id],
    })),
}));

//---------------------------------------------------------------------------------------------------------------
