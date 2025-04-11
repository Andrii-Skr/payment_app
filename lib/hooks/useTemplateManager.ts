// hooks/useTemplateManager.ts
import { apiClient } from "@/services/api-client";
import { FormValues } from "@/types/formTypes";
import { template } from "@prisma/client";

export function useTemplateManager({
  reset,
  getValues,
  entityIdNum,
  setTemplatesList,
}: {
  reset: (values: FormValues) => void;
  getValues: () => FormValues;
  entityIdNum: number;
  setTemplatesList: (templates: template[]) => void;
}) {
  const handleSampleChange = (
    i: number,
    templatesList: template[],
    setSelectedTemplate: (t: template | null) => void,
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
    setValue("sample", sampleValue);
    const formData = getValues();
    if (formData.partner_id) {
      const { payments, ...dataToSend } = formData;
      await apiClient.document.createTemplate(
        //@ts-ignore
        dataToSend as Omit<FormValues, "payments">
      );
    }
    const updated = await apiClient.document.getTemplateById(entityIdNum);
    if (updated) setTemplatesList(updated);
  };

  const confirmTemplateReplace = (template: template) => {
    return {
      doc_id: undefined,
      entity_id: template.entity_id,
      partner_id: template.partner_id,
      accountNumber: template.account_number,
      accountSum: String(template.account_sum),
      date: template.date,
      purposeOfPayment: template.purpose_of_payment,
      note: template.note || "",
      edrpou: template.edrpou,
      mfo: template.mfo,
      partnerName: template.partner_name,
      selectedAccount: template.bank_account,
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

  return { handleSampleChange, handleSaveTemplate, confirmTemplateReplace };
}
