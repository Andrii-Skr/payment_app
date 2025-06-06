import { create } from "zustand";
import { PaymentDetail } from "@/types/types";

interface PaymentStore {
  pendingPayments: PaymentDetail[];
  isPaymentPanelExpanded: boolean;
  setPendingPayments: (payments: PaymentDetail[]) => void;
  addPendingPayments: (payments: PaymentDetail[]) => void;
  clearPendingPayments: () => void;
  expandPaymentPanel: () => void;
  collapsePaymentPanel: () => void;
}

const PENDING_STORAGE_KEY = "pendingPayments";
const PENDING_TIMESTAMP_KEY = "pendingPayments_ts";
const EXPIRATION_HOURS = 4;

function saveToStorage(payments: PaymentDetail[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(payments));
    localStorage.setItem(PENDING_TIMESTAMP_KEY, Date.now().toString());
  }
}

function loadFromStorage(): PaymentDetail[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(PENDING_STORAGE_KEY);
  const ts = localStorage.getItem(PENDING_TIMESTAMP_KEY);

  if (!raw || !ts) return [];

  try {
    const now = Date.now();
    const savedAt = parseInt(ts, 10);
    const hoursPassed = (now - savedAt) / 1000 / 60 / 60;

    if (hoursPassed > EXPIRATION_HOURS) {
      localStorage.removeItem(PENDING_STORAGE_KEY);
      localStorage.removeItem(PENDING_TIMESTAMP_KEY);
      return [];
    }

    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const usePaymentStore = create<PaymentStore>((set, get) => {
  const initialPending = loadFromStorage();

  return {
    pendingPayments: initialPending,
    isPaymentPanelExpanded: false,

    setPendingPayments: (payments) => {
      saveToStorage(payments);
      set({ pendingPayments: payments });
    },

    addPendingPayments: (payments) => {
      const merged = [...get().pendingPayments, ...payments];
      saveToStorage(merged);
      set({ pendingPayments: merged });
    },

    clearPendingPayments: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(PENDING_STORAGE_KEY);
        localStorage.removeItem(PENDING_TIMESTAMP_KEY);
      }
      set({ pendingPayments: [] });
    },

    expandPaymentPanel: () => set({ isPaymentPanelExpanded: true }),
    collapsePaymentPanel: () => set({ isPaymentPanelExpanded: false }),
  };
});
