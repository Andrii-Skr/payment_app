import { create } from "zustand";
import { DocumentWithPartner } from "@/prisma/data/documents";   // ← уже number
import { apiClient } from "@/services/api-client";
import { normalizeArray } from "@/utils/normalizeDecimal";

type State = { docs: DocumentWithPartner[] };

type Actions = {
  fetchDocs: (entityId: number) => Promise<void>;
  removeDoc: (docId: number, entityId: number) => Promise<void>;
};

export const useDocumentsStore = create<State & Actions>((set) => ({
  docs: [],

  fetchDocs: async (entityId) => {
    const raw = await apiClient.documents.getByEntity(entityId);
    if (raw) set({ docs: normalizeArray(raw) });          // типы совпадают
  },

  removeDoc: async (docId, entityId) => {
    await apiClient.documents.remove(docId);
    const raw = await apiClient.documents.getByEntity(entityId);
    if (raw) set({ docs: normalizeArray(raw) });
  },
}));
