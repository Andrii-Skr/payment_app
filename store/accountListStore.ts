import { PartnerAccountWithEntities } from "@/services/partners";
import { partner_account_number } from "@prisma/client";
import { create } from "zustand";

export type AccountItem = partner_account_number & {
  is_default: boolean;
  is_visible: boolean;
  is_deleted: boolean;
};

type AccountListState = {
  currentAccountList: AccountItem[];
};
type AccountListAction = {
  updateAccountList: (accounts: (PartnerAccountWithEntities | AccountItem)[]) => void;
};

export const useAccountListStore = create<AccountListState & AccountListAction>(
  (set) => ({
    currentAccountList: [],
    updateAccountList: (accounts) =>
      set({
        currentAccountList: accounts
          .filter((a) =>
            "entities" in a ? (a.entities as any).length > 0 : true,
          )
          .map((a) => {
            const rel = "entities" in a ? (a.entities as any)[0] : undefined;
            return {
              ...a,
              is_default: rel?.is_default ?? (a as any).is_default ?? false,
              is_visible: rel?.is_visible ?? (a as any).is_visible ?? true,
              is_deleted: rel?.is_deleted ?? (a as any).is_deleted ?? false,
            } as AccountItem;
          })
          .filter((a) => !a.is_deleted),
      }),
  })
);
