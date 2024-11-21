import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { entity } from "@prisma/client";
import { FormValues } from '@/components/shared/paymentForm';

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
