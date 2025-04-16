import { create } from "zustand";
import { persist } from "zustand/middleware";
import { entity, partner_account_number } from "@prisma/client";
import { FormValues } from "@/types/formTypes";
import { PaymentDetail } from "../types/types";

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

type formState = {
  currentFormData: Partial<FormValues>;
};

type formAction = {
  updateCurrentFormData: (formData: Partial<FormValues>) => void;
};

export const useFormStore = create<formState & formAction>((set) => ({
  currentFormData: {},
  updateCurrentFormData: (formData) =>
    set((state) => ({
      currentFormData: { ...state.currentFormData, ...formData },
    })),
}));

// -----------------------------------------------------------------------------------------------------

type AccountListState = {
  currentAccountList: partner_account_number[];
};
type AccountListAction = {
  updateAccountList: (accounts: partner_account_number[]) => void;
};

export const useAccountListStore = create<AccountListState & AccountListAction>(
  (set) => ({
    currentAccountList: [],
    updateAccountList: (accounts) => set({ currentAccountList: accounts }),
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

interface PaymentStore {
  pendingPayments: PaymentDetail[];
  isPaymentPanelExpanded: boolean;
  setPendingPayments: (payments: PaymentDetail[]) => void;
  addPendingPayments: (payments: PaymentDetail[]) => void;
  clearPendingPayments: () => void;
  expandPaymentPanel: () => void;
  collapsePaymentPanel: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  pendingPayments: [],
  isPaymentPanelExpanded: false,
  setPendingPayments: (payments) => set({ pendingPayments: payments }),
  addPendingPayments: (payments) =>
    set((state) => ({
      pendingPayments: [...state.pendingPayments, ...payments],
    })),
  clearPendingPayments: () => set({ pendingPayments: [] }),
  expandPaymentPanel: () => set({ isPaymentPanelExpanded: true }),
  collapsePaymentPanel: () => set({ isPaymentPanelExpanded: false }),
}));
