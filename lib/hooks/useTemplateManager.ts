import { apiClient } from "@/services/api-client";
import { FormValues } from "@/types/formTypes";
import { template } from "@prisma/client";
import { toast } from "@/lib/hooks/use-toast";
import { TemplateWithBankDetails } from "@/app/api/document/get/template/[entity_id]/route";

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
  const handleSampleChange = (
    i: number,
    templatesList: TemplateWithBankDetails[],
    setSelectedTemplate: (t: TemplateWithBankDetails | null) => void,
    setDialogOpen: (v: boolean) => void
  ) => {
    const foundTemplate = templatesList[i];
    if (foundTemplate) {
      setSelectedTemplate(foundTemplate);
      setDialogOpen(true);
    }
  };

  const handleSaveTemplate = async (
    sampleValue: string,
    setValue: (name: keyof FormValues, value: any) => void
  ) => {
    const existingTemplates = await apiClient.document.getTemplateById(entityIdNum);

    const isDuplicate = existingTemplates?.some(
      (template) =>
        template.name.trim().toLowerCase() === sampleValue.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Шаблон с таким названием уже существует.");
      return;
    }

    setValue("sample", sampleValue);
    const formData = getValues();

    if (formData.partner_id) {
      const { payments, ...dataToSend } = formData;
      await apiClient.document.createTemplate(dataToSend as Omit<FormValues, "payments">);
    }

    const updated = await apiClient.document.getTemplateById(entityIdNum);
    if (updated) setTemplatesList(updated);

    toast.success("Шаблон успешно сохранён.");
  };

  const confirmTemplateReplace = (template: TemplateWithBankDetails) => {
    return {
      doc_id: undefined,
      entity_id: template.entity_id,
      partner_id: template.partner_id,
      accountNumber: template.account_number,
      accountSum: String(template.account_sum),
      date: template.date,
      vatType: template.vat_type,
      vatPercent: Number(template.vat_percent),
      purposeOfPayment: template.purpose_of_payment,
      note: template.note || "",
      edrpou: template.edrpou,
      mfo: template.partner_account_number?.mfo || "",
      bank_name: template.partner_account_number?.bank_name || "",
      partner_account_number_id: template.partner_account_number_id,
      partnerName: template.partner_name,
      selectedAccount: template.partner_account_number?.bank_account || "",
      accountSumExpression: "",
      payments: [
        {
          documents_id: undefined,
          paySum: 0,
          expectedDate: null,
          deadLineDate: null,
          paidDate: null,
        },
      ],
    };
  };

  return {
    handleSampleChange,
    handleSaveTemplate,
    confirmTemplateReplace,
  };
}
