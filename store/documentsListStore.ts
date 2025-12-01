import { create } from "zustand";
import type { DocumentWithPartner } from "@/prisma/data/documents"; // ← уже number
import { apiClient } from "@/services/api-client";
import { normalizeArray } from "@/utils/normalizeDecimal";

type State = { docs: DocumentWithPartner[] };

type Actions = {
  fetchDocs: (entityId: number) => Promise<void>;
  removeDoc: (docId: number, entityId: number) => Promise<void>;
};

type Selectors = {
  getRemainder: (entityId: number, partnerId: number) => number;
};

export const useDocumentsStore = create<State & Actions & Selectors>((set, get) => ({
  docs: [],

  fetchDocs: async (entityId) => {
    const raw = await apiClient.documents.getByEntity(entityId);
    if (raw) set({ docs: normalizeArray(raw) });
  },

  removeDoc: async (docId, entityId) => {
    await apiClient.documents.remove(docId);
    const raw = await apiClient.documents.getByEntity(entityId);
    if (raw) set({ docs: normalizeArray(raw) });
  },

  getRemainder: (entityId, partnerId) => {
    const docs = get().docs.filter((d) => d.entity_id === entityId && d.partner_id === partnerId);
    const total = docs.reduce((acc, doc) => {
      const specSum = doc.spec_doc.reduce((s, spec) => s + +spec.pay_sum, 0);
      return acc + +doc.account_sum - specSum;
    }, 0);
    return Number(total.toFixed(2));
  },
}));
