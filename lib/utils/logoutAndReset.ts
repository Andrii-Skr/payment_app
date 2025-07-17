import { signOut } from "next-auth/react";
import { useEntitySelectionStore } from "@/store/entitySelectionStore";

export function logoutAndReset(callbackUrl: string) {
  // очищаем сохранённое значение
  useEntitySelectionStore.persist?.clearStorage();
  useEntitySelectionStore.setState({ selectedEntity: "all" });
  return signOut({ callbackUrl });
}
