"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartnerForm } from "./partnerForm";
import { PartnerAccountsList } from "./partnerAccountsList";
import { PartnersWithAccounts } from "@/services/partners";
import { toast } from "@/lib/hooks/use-toast";
import { useState } from "react";
import type { AccountItem } from "@/store/accountListStore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form } from "@/components/ui";
import { Container, PartnerInput } from "@/components/shared";
import { apiClient } from "@/services/api-client";
import { useToggleDelete } from "@/lib/hooks/useToggleDelete";

const toAccountItem = (acc: any): AccountItem => {
  const rel = "entities" in acc ? (acc.entities as any)[0] : undefined;
  return {
    ...acc,
    is_default: rel?.is_default ?? acc.is_default ?? false,
    is_visible: rel?.is_visible ?? acc.is_visible ?? true,
    is_deleted: rel?.is_deleted ?? acc.is_deleted ?? false,
  } as AccountItem;
};

type BankForm = {
  bank_account: string;
  mfo?: string;
  bank_name?: string;
};

export const PartnerEditModal = ({
  open,
  onOpenChange,
  partner,
  entityId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  partner: PartnersWithAccounts;
  entityId: number;
  onSaved: () => void;
}) => {
  const [accounts, setAccounts] = useState<AccountItem[]>(
    partner.partner_account_number.map(toAccountItem)
  );
  const [loadingAccId, setLoadingAccId] = useState<number | null>(null);

  const mutateAccounts = (
    fn: (arr: AccountItem[]) => AccountItem[]
  ) => setAccounts((prev) => fn(prev));

  const toggleDeleteAccount = useToggleDelete({
    apiFn: apiClient.partners.deleteAccount,
    mutateFn: (id, is_deleted, _entityId) =>
      mutateAccounts((arr) =>
        arr.map((a) => (a.id === id ? { ...a, is_deleted } : a))
      ),
    getEntityState: (id, _entityId) =>
      accounts.find((a) => a.id === id)?.is_deleted ?? false,
    messages: {
      delete: "Счёт удалён",
      restore: "Счёт восстановлен",
      error: "Ошибка при обновлении счёта",
    },
  });

  const handleSetDefault = async (accId: number, checked: boolean) => {
    setLoadingAccId(accId);
    try {
      await apiClient.partners.setDefaultAccount(accId, entityId, checked);
      mutateAccounts((arr) =>
        arr.map((a) => ({ ...a, is_default: checked ? a.id === accId : false }))
      );
      toast.success(
        checked ? "Счёт назначен основным" : "Счёт больше не основной"
      );
    } catch {
      toast.error(
        checked ? "Не удалось назначить счёт" : "Не удалось снять счёт"
      );
    } finally {
      setLoadingAccId(null);
    }
  };

  const bankSchema = z.object({
    bank_account: z.string().length(29, "29 символов"),
    mfo: z.string().optional(),
    bank_name: z.string().optional(),
  });

  const bankForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: { bank_account: "" },
  });

  const [addMode, setAddMode] = useState(false);

  const handleAddBank = async (vals: BankForm) => {
    setLoadingAccId(-1);
    try {
      const result = await apiClient.partners.addBankAccount({
        partner_id: partner.id,
        entity_id: entityId,
        ...vals,
      });

      if (result.message) {
        toast.error(result.message);
      } else {
        const accItem = toAccountItem(result.created);
        mutateAccounts((arr) => [...arr, accItem]);
        toast.success("Счёт добавлен");
        bankForm.reset();
        setAddMode(false);
      }
    } catch {
      toast.error("Не удалось добавить счёт");
    } finally {
      setLoadingAccId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>Редактирование контрагента</DialogTitle>
        </DialogHeader>

        <PartnerForm
          mode="edit"
          entityId={entityId}
          initialValues={{
            id: partner.id,
            full_name: partner.full_name,
            short_name: partner.short_name,
            edrpou: partner.edrpou,
            bank_account:
              accounts.find((a) => a.is_default)?.bank_account ?? "",
          }}
          onSaved={() => {
            onSaved();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />

        <PartnerAccountsList
          accounts={accounts}
          loadingId={loadingAccId}
          showDeleted={true}
          showHidden={true}
          onSetDefault={(accId, checked) => handleSetDefault(accId, checked)}
          onDelete={toggleDeleteAccount}
          entityId={entityId}
        />

        {!addMode ? (
          <Button variant="ghost" onClick={() => setAddMode(true)}>
            + Добавить счёт
          </Button>
        ) : (
          <Form {...bankForm}>
            <form
              onSubmit={bankForm.handleSubmit(handleAddBank)}
              className="space-y-2 mt-4"
            >
              <Container className="justify-start gap-2">
                <PartnerInput<BankForm>
                  control={bankForm.control}
                  name="bank_account"
                  label="Счёт"
                  className="bank-account-size"
                />
              </Container>

              <div className="flex gap-2">
                <Button type="submit">Сохранить</Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    bankForm.reset();
                    setAddMode(false);
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
