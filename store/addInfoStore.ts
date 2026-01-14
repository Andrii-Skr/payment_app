import { create } from "zustand";
import { createJSONStorage, devtools, persist, subscribeWithSelector } from "zustand/middleware";

export type AddInfoTab = "entity" | "partner" | "user" | "sample";

type AddInfoState = {
  activeTab: AddInfoTab;
  hasHydrated: boolean;
  setActiveTab: (tab: AddInfoTab) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  activeTab: "entity" as AddInfoTab,
  hasHydrated: false,
};

export const useAddInfoStore = create<AddInfoState>()(
  subscribeWithSelector(
    devtools(
      persist(
        (set) => ({
          ...initialState,
          setActiveTab: (tab) => set({ activeTab: tab }),
          setHasHydrated: (value) => set({ hasHydrated: value }),
          reset: () => set({ activeTab: initialState.activeTab }),
        }),
        {
          name: "add-info-store",
          version: 1,
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({ activeTab: state.activeTab }),
          migrate: (state) => ({ ...initialState, ...(state as Partial<AddInfoState>) }),
          onRehydrateStorage: () => (state) => {
            state?.setHasHydrated(true);
          },
        },
      ),
      { name: "add-info-store", enabled: process.env.NODE_ENV === "development" },
    ),
  ),
);
