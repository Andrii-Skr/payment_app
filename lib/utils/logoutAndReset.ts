import { signOut } from "next-auth/react";
import { useEntitySelectionStore } from "@/store/entitySelectionStore";
import { usePaymentStore } from "@/store/paymentStore";

export function logoutAndReset(callbackUrl: string) {
  usePaymentStore.getState().clearPendingPayments();
  useEntitySelectionStore.persist?.clearStorage();
  useEntitySelectionStore.setState({ selectedEntity: "all" });
  return signOut({ callbackUrl });
}
