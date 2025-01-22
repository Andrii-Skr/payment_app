import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { entity, partner_account_number } from "@prisma/client";
import { FormValues } from '@/components/shared/paymentForm';
import { addDays, subDays } from "date-fns";

    type entityState = {
    currentEntity?:entity
  }

  type entityAction = {
    updateCurrentEntity: (entity: entityState["currentEntity"]) => void

  }
  type PersistedEntityState = entityState & entityAction;

  export const useEntityStore = create(
    persist<PersistedEntityState>(
      (set) => ({
        currentEntity: undefined,
        updateCurrentEntity: (entity) => set({ currentEntity: entity }),
      }),
      {
        name: 'entity-storage',
      }
    )
  );

// -----------------------------------------------------------------------------------------------------

  type formState = {
    currentFormData:Partial<FormValues>
  }

  type formAction = {
    updateCurrentFormData: (formData: Partial<FormValues>) => void

  }


  export const useFormStore = create<formState & formAction>((set) => ({
    currentFormData: {},
    updateCurrentFormData: (formData) => set((state) => ({
      currentFormData: { ...state.currentFormData, ...formData }
    }))
  }));

// -----------------------------------------------------------------------------------------------------

type AccountListState ={
  currentAccountList: partner_account_number[];
}
type AccountListAction  = {
  updateAccountList: (accounts: partner_account_number[]) => void

}

export const useAccountListStore = create<AccountListState & AccountListAction>((set) => ({
  currentAccountList: [],

  updateAccountList: (accounts) => set({ currentAccountList: accounts}),
}));

// -----------------------------------------------------------------------------------------------------



interface DateStoreState {
  startDate: Date;
  goForward: () => void;
  goBackward: () => void;
  setDate: (newDate: Date) => void;
}

export const useDateStore = create<DateStoreState>((set) => ({
  startDate: new Date(), // Текущая дата, от которой пляшем (начало недели)
  goForward: () =>
    set((state) => ({
      startDate: addDays(state.startDate, 7),
    })),
  goBackward: () =>
    set((state) => ({
      startDate: subDays(state.startDate, 7),
    })),
  setDate: (newDate: Date) =>
    set(() => ({
      startDate: newDate,
    })),
}));

