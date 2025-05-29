import { create } from "zustand";
import { PartnersWithAccounts } from "@/services/partners";
import { apiClient } from "@/services/api-client";

interface PartnersState {
  partners: PartnersWithAccounts[];
  fetchPartners: (entityId: number) => Promise<void>;
  clearPartners: () => void;
}

export const usePartnersStore = create<PartnersState>((set) => ({
  partners: [],
  fetchPartners: async (entityId: number) => {
    const data = await apiClient.partners.partnersService(entityId,{ showHidden: true });
    set({ partners: data ?? [] });
  },
  clearPartners: () => set({ partners: [] }),
}));
