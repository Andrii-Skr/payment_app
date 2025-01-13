import { FormValues, PaymentValues } from "@/components/shared/paymentForm";

export const TransformedObject = (data: any): FormValues => {
return {
    entity_id: data.entity_id || undefined,
    accountNumber: data.account_number || "",
    date: data.date || undefined,
    accountSum: Number(data.account_sum) || 0,
    edrpou: data.partners?.edrpou || "",
    payments: data.spec_doc?.map((specDoc:{pay_sum: number, expected_date: string, dead_line_date: string}) => ({
      paySum: specDoc.pay_sum,
      expectedDate: specDoc.expected_date,
      deadLineDate: specDoc.dead_line_date,
    })) || [],
    selectedAccount:
      data.bank_account || data.selectedAccount || undefined,
    partner_id: data.partner_id || 0,
    partnerName: data.partners.name,
    purposeOfPayment: data.purpose_of_payment || "",
    mfo: data.mfo
  };
}
