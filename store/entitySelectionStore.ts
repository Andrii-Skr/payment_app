import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EntitySelectionState {
  selectedEntity: number | "all";
  setSelectedEntity: (id: number | "all") => void;
}

export const useEntitySelectionStore = create(
  persist<EntitySelectionState>(
    (set) => ({
      selectedEntity: "all",
      setSelectedEntity: (id) => set({ selectedEntity: id }),
    }),
    {
      name: "entity-selection",
    }
  )
);
