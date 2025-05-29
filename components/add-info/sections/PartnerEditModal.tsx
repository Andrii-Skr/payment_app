"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartnerForm } from "./PartnerForm";
import { PartnerAccountsList } from "./PartnerAccountsList";
import { PartnersWithAccounts } from "@/services/partners";
import { toast } from "@/lib/hooks/use-toast";
import { useState } from "react";
import { partner_account_number } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form } from "@/components/ui";
import { Container, PartnerInput } from "@/components/shared";
import { apiClient } from "@/services/api-client";
import { useToggleDelete } from "@/lib/hooks/useToggleDelete";

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
  const [accounts, setAccounts] = useState<partner_account_number[]>(partner.partner_account_number);
  const [loadingAccId, setLoadingAccId] = useState<number | null>(null);

  const mutateAccounts = (fn: (arr: partner_account_number[]) => partner_account_number[]) =>
    setAccounts((prev) => fn(prev));

  const toggleDeleteAccount = useToggleDelete({
    apiFn: apiClient.partners.deleteAccount,
    mutateFn: (id, is_deleted) =>
      mutateAccounts((arr) =>
        arr.map((a) => (a.id === id ? { ...a, is_deleted } : a))
      ),
    getEntityState: (id) => accounts.find((a) => a.id === id)?.is_deleted ?? false,
    messages: {
      delete: "Счёт удалён",
      restore: "Счёт восстановлен",
      error: "Ошибка при обновлении счёта",
    },
  });

  const handleSetDefault = async (accId: number) => {
    setLoadingAccId(accId);
    try {
      await apiClient.partners.setDefaultAccount(accId);
      mutateAccounts((arr) =>
        arr.map((a) => ({ ...a, is_default: a.id === accId }))
      );
      toast.success("Счёт назначен основным");
    } catch {
      toast.error("Не удалось назначить счёт");
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
      const created = await apiClient.partners.addBankAccount({
        partner_id: partner.id,
        ...vals,
      });
      mutateAccounts((arr) => [...arr, created]);
      toast.success("Счёт добавлен");
      bankForm.reset();
      setAddMode(false);
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
            bank_account: accounts.find((a) => a.is_default)?.bank_account ?? "",
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
          onSetDefault={handleSetDefault}
          onDelete={toggleDeleteAccount}
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
