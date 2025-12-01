import { create } from "zustand";
import { apiClient } from "@/services/api-client";
import type { PartnersWithAccounts } from "@/services/partners";

interface PartnersState {
  partners: PartnersWithAccounts[];
  fetchPartners: (entityId: number) => Promise<void>;
  clearPartners: () => void;
}

export const usePartnersStore = create<PartnersState>((set) => ({
  partners: [],
  fetchPartners: async (entityId: number) => {
    const data = await apiClient.partners.partnersService(entityId, { showHidden: true });
    set({ partners: data ?? [] });
  },
  clearPartners: () => set({ partners: [] }),
}));
