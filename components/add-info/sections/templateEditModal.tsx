"use client";

import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";
import type { TemplateWithBankDetails } from "@api/templates/[id]/route";

import {
  FormDatePicker,
  FormInput,
  FormTextarea,
  VatSelector,
} from "@/components/shared";

/* ---------------- schema & types ---------------- */
const templateSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  date: z.union([z.date(), z.string()]).nullable(),
  accountSum: z
    .string()
    .refine(
      (v) => !isNaN(Number(v.replace(/,/g, "."))),
      "Сумма должна быть числом"
    )
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

export const TemplateEditModal: React.FC<Props> = ({
  template,
  open,
  onOpenChange,
  onSaved,
}) => {
  /* -------- form -------- */
  const methods = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      date: template.date ? new Date(template.date) : null,
      accountSum: template.account_sum?.toString() ?? "0",
      vatType: template.vat_type,
      vatPercent: Number(template.vat_percent),
      purposeOfPayment: template.purpose_of_payment ?? "",
      note: template.note ?? "",
    },
  });

  const { handleSubmit, reset, control, setValue } = methods;

  /* -------- refill on reopen -------- */
  useEffect(() => {
    if (open) {
      reset({
        name: template.name,
        date: template.date ? new Date(template.date) : null,
        accountSum: template.account_sum?.toString() ?? "0",
        vatType: template.vat_type,
        vatPercent: Number(template.vat_percent),
        purposeOfPayment: template.purpose_of_payment ?? "",
        note: template.note ?? "",
      });
    }
  }, [open, template, reset]);

  /* -------- submit -------- */
  const onSubmit = async (d: TemplateFormData) => {
    try {
      await apiClient.templates.update(template.id, {
        entity_id: template.entity_id,
        sample: d.name.trim(),
        partner_id: template.partner_id,
        full_name: template.full_name,
        short_name: template.short_name,
        edrpou: template.edrpou,
        accountNumber: template.account_number ?? "",
        accountSum: d.accountSum,
        accountSumExpression: template.account_sum_expression ?? "",
        vatType: d.vatType,
        vatPercent: d.vatPercent,
        date: d.date ? format(d.date, "yyyy-MM-dd") : null,
        partner_account_number_id: template.partner_account_number_id,
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

            <FormDatePicker control={control} name="date" label="Дата" />

            {/* <FormInput
              control={control}
              name="accountSum"
              label="Сумма"
              type="number"
            /> */}

            <VatSelector control={control} setValue={setValue} />

            <FormTextarea
              control={control}
              name="purposeOfPayment"
              label="Назначение платежа"
              rows={3}
            />

            <FormTextarea
              control={control}
              name="note"
              label="Примечание"
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
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
