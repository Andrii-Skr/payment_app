"use client";

import { apiClient } from "@/services/api-client";
import { FormValues } from "@/types/formTypes";
import { toast } from "@/lib/hooks/use-toast";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";
import { TemplatePayload } from "@/services/templates";
import { format } from "date-fns";

export function useTemplateManager({
  reset,
  getValues,
  entityIdNum,
  setTemplatesList,
}: {
  reset: (values: FormValues) => void;
  getValues: () => FormValues;
  entityIdNum: number;
  setTemplatesList: (templates: TemplateWithBankDetails[]) => void;
}) {
  /* ---------- выбор шаблона ---------- */
  const handleSampleChange = (
    idx: number,
    list: TemplateWithBankDetails[],
    setSelected: (t: TemplateWithBankDetails | null) => void,
    setDialogOpen: (v: boolean) => void
  ) => {
    const tpl = list[idx];

    if (tpl) {
      setSelected(tpl);
      setDialogOpen(true);
    }
  };

  /* ---------- сохранение (upsert) ---------- */
  const handleSaveTemplate = async (
    sampleValue: string,
    setValue: (name: keyof FormValues, value: string) => void
  ) => {
    setValue("sample", sampleValue.trim());

     const { payments, full_name, short_name, ...payload } = getValues();

    const res = await apiClient.templates.save({
      ...payload,
      date: payload.date ? format(payload.date, "yyyy-MM-dd") : undefined,
    } as TemplatePayload);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);

    const updated = await apiClient.templates.getById(entityIdNum);
    if (updated) setTemplatesList(updated);

    setValue("sample", "");
  };

  /* ---------- применить шаблон к форме ---------- */
  const confirmTemplateReplace = (tpl: TemplateWithBankDetails) => ({
    sample: tpl.name,
    doc_id: undefined,
    entity_id: tpl.entity_id,
    partner_id: tpl.partner_id,
    accountNumber: tpl.account_number || "",
    accountSum: tpl.account_sum ? String(tpl.account_sum) : "0",
    accountSumExpression: tpl.account_sum_expression ?? undefined,
    date: tpl.date || null,
    vatType: tpl.vat_type,
    vatPercent: Number(tpl.vat_percent),
    purposeOfPayment: tpl.purpose_of_payment?.split("№")[0]?.trim() ?? "",
    note: tpl.note || "",
    edrpou: tpl.edrpou,
    mfo: tpl.partner_account_number?.mfo || "",
    bank_name: tpl.partner_account_number?.bank_name || "",
    partner_account_number_id: tpl.partner_account_number_id,
    full_name: tpl.partner.full_name,
    short_name: tpl.partner.short_name,
    selectedAccount: tpl.partner_account_number?.bank_account || "",
    payments: [
      {
        documents_id: undefined,
        paySum: 0,
        expectedDate: null,
        deadLineDate: null,
        paidDate: null,
      },
    ],
  });

  return {
    handleSampleChange,
    handleSaveTemplate,
    confirmTemplateReplace,
  };
}
