import { create } from "zustand";
import { DocumentWithPartner } from "@/prisma/data/documents";
import { apiClient } from "@/services/api-client";

type State = {
  docs: DocumentWithPartner[];
};

type Actions = {
  fetchDocs: (entityId: number) => Promise<void>;
  removeDoc: (docId: number, entityId: number) => Promise<void>;
};

export const useDocumentsStore = create<State & Actions>((set) => ({
  docs: [],

  fetchDocs: async (entityId) => {
    const data = await apiClient.documents.getByEntity(entityId);
    if (data) set({ docs: data });
  },

  removeDoc: async (docId, entityId) => {
    await apiClient.documents.remove(docId);
    const data = await apiClient.documents.getByEntity(entityId);
    if (data) set({ docs: data });
  },
}));
