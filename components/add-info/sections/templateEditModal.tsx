"use client";

import type { TemplateWithBankDetails } from "@api/templates/[id]/route";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { BadgeCheck } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Combobox, ContainerGrid, FormDatePicker, FormInput, FormTextarea, VatSelector } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBankAccount } from "@/lib/helpers/formatiban";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";
import type { PartnerAccountWithEntities } from "@/services/partners";

/* ---------------- schema & types ---------------- */
const templateSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  date: z.union([z.date(), z.string()]).nullable(),
  accountNumber: z.string().optional(),
  accountId: z.coerce.number({ required_error: "Выберите счёт" }),
  accountSum: z
    .string()
    .refine((v) => !Number.isNaN(Number(v.replace(/,/g, "."))), "Сумма должна быть числом")
    .transform((v) => v.replace(/,/g, ".")),
  vatType: z.boolean(),
  vatPercent: z.coerce.number().min(0),
  purposeOfPayment: z.string().nullable(),
  note: z.string().nullable(),
});
type TemplateFormData = z.infer<typeof templateSchema>;

/* ---------------- props ---------------- */
interface Props {
  template: TemplateWithBankDetails;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

export const TemplateEditModal: React.FC<Props> = ({ template, open, onOpenChange, onSaved }) => {
  /* -------- form -------- */
  const methods = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      date: template.date ? new Date(template.date) : null,
      accountNumber: template.account_number ?? "",
      accountId: template.partner_account_number_id,
      accountSum: template.account_sum?.toString() ?? "0",
      vatType: template.vat_type,
      vatPercent: Number(template.vat_percent),
      purposeOfPayment: template.purpose_of_payment ?? "",
      note: template.note ?? "",
    },
  });

  const { handleSubmit, reset, control, setValue } = methods;
  const { getValues, watch } = methods;
  const [accounts, setAccounts] = useState<PartnerAccountWithEntities[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const currentAccountId = watch("accountId");
  const currentAccountIdNum = Number(currentAccountId) || null;

  const availableAccounts = useMemo(() => {
    const visibleAccounts = accounts.filter((a) => !a.is_deleted && a.is_visible !== false);

    if (currentAccountIdNum && !visibleAccounts.some((a) => a.id === currentAccountIdNum)) {
      const current = accounts.find((a) => a.id === currentAccountIdNum);
      if (current) return [...visibleAccounts, current];
    }

    return visibleAccounts;
  }, [accounts, currentAccountIdNum]);

  /* -------- refill on reopen -------- */
  useEffect(() => {
    if (open) {
      reset({
        name: template.name,
        date: template.date ? new Date(template.date) : null,
        accountNumber: template.account_number ?? "",
        accountId: template.partner_account_number_id,
        accountSum: template.account_sum?.toString() ?? "0",
        vatType: template.vat_type,
        vatPercent: Number(template.vat_percent),
        purposeOfPayment: template.purpose_of_payment ?? "",
        note: template.note ?? "",
      });
    }
  }, [open, template, reset]);

  /* -------- load partner accounts -------- */
  useEffect(() => {
    if (!open) return;

    const loadAccounts = async () => {
      setAccountsLoading(true);
      try {
        const partner = await apiClient.partners.getByEdrpou(template.edrpou, template.entity_id);

        const list = partner?.partner_account_number ?? [];
        setAccounts(list);

        if (list.length === 0) return;

        const selectedId = Number(getValues("accountId")) || null;
        const exists = selectedId ? list.some((a) => a.id === selectedId) : false;

        if (!exists) {
          const preferred =
            list.find((a) => a.is_default && !a.is_deleted && a.is_visible !== false) ??
            list.find((a) => !a.is_deleted && a.is_visible !== false) ??
            list[0];

          if (preferred) setValue("accountId", preferred.id);
        }
      } catch {
        toast.error("Не удалось загрузить счета");
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, [open, template.edrpou, template.entity_id, getValues, setValue]);

  /* -------- submit -------- */
  const onSubmit = async (d: TemplateFormData) => {
    const selectedAccount = accounts.find((a) => a.id === Number(d.accountId));
    if (!selectedAccount) {
      toast.error("Выберите счёт");
      return;
    }

    try {
      await apiClient.templates.update(template.id, {
        entity_id: template.entity_id,
        sample: d.name.trim(),
        partner_id: template.partner_id,
        edrpou: template.edrpou,
        accountNumber: d.accountNumber?.trim() ?? "",
        accountSum: d.accountSum,
        accountSumExpression: template.account_sum_expression ?? "",
        vatType: d.vatType,
        vatPercent: d.vatPercent,
        date: d.date ? format(d.date, "yyyy-MM-dd") : null,
        partner_account_number_id: d.accountId,
        purposeOfPayment: d.purposeOfPayment || undefined,
        note: d.note || undefined,
      });

      toast.success("Шаблон обновлён");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Не удалось сохранить изменения");
    }
  };

  /* ---------------- render ---------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Редактировать шаблон</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <FormInput control={control} name="name" label="Название" />

            <ContainerGrid>
              <Combobox
                control={control}
                name="accountId"
                label="Счёт"
                className="bank-account-size !min-w-[320px]"
                placeholder={accountsLoading ? "Загрузка счетов..." : "Выберите счёт"}
                empty="Счета не найдены"
                disabled={accountsLoading || availableAccounts.length === 0}
                list={availableAccounts.map((acc) => ({
                  key: String(acc.id),
                  value: String(acc.id),
                  label: (
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span>
                        {formatBankAccount(acc.bank_account)}
                        {acc.bank_name ? ` - ${acc.bank_name}` : ""}
                      </span>
                      {acc.is_default ? (
                        <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-label="Основной счёт" />
                      ) : null}
                    </span>
                  ),
                }))}
                onChange={(idx) => {
                  const acc = availableAccounts[idx];
                  if (acc) setValue("accountId", acc.id);
                }}
              />
            </ContainerGrid>
            <ContainerGrid>
              <FormInput
                control={control}
                name="accountNumber"
                label="Номер счета/договора"
                placeholder="Введите номер счета"
              />

              <FormInput control={control} name="accountSum" label="Сумма" type="number" />

              <FormDatePicker control={control} name="date" label="Дата" />
            </ContainerGrid>
            <VatSelector control={control} setValue={setValue} />

            <FormTextarea control={control} name="purposeOfPayment" label="Назначение платежа" rows={3} />

            <FormTextarea control={control} name="note" label="Примечание" rows={3} />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
