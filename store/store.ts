import { create } from "zustand";
import { persist } from "zustand/middleware";
import { entity, partner_account_number } from "@prisma/client";
import type { PartnerAccountWithEntities } from "@/services/partners";


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
    }
  )
);


// -----------------------------------------------------------------------------------------------------

export type AccountItem = partner_account_number & {
  is_default: boolean;
  is_visible: boolean;
  is_deleted: boolean;
};

type AccountListState = {
  currentAccountList: AccountItem[];
};
type AccountListAction = {
  updateAccountList: (accounts: (PartnerAccountWithEntities | AccountItem)[]) => void;
};

export const useAccountListStore = create<AccountListState & AccountListAction>(
  (set) => ({
    currentAccountList: [],
    updateAccountList: (accounts) =>
      set({
        currentAccountList: accounts
          .map((a) => {
            const rel = "entities" in a ? (a.entities as any)[0] : undefined;
            return {
              ...a,
              is_default: rel?.is_default ?? (a as any).is_default ?? false,
              is_visible: rel?.is_visible ?? (a as any).is_visible ?? true,
              is_deleted: rel?.is_deleted ?? (a as any).is_deleted ?? false,
            } as AccountItem;
          })
          .filter((a) => !a.is_deleted),
      }),
  })
);

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


