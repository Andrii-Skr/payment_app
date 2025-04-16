import { FormValues } from "@/types/formTypes";

export const TransformedObject = (data: any): FormValues => {
  console.log("data", data);
  return {
    doc_id: data.id ?? undefined,
    entity_id: data.entity_id ?? undefined,
    accountNumber: data.account_number ?? "",
    date: data.date ?? undefined,
    accountSum: data.account_sum ?? "0",
    accountSumExpression: data.account_sum_expression ?? "",
    vatType: data.vat_type ?? false,
    vatPercent: data.vat_percent ?? 0,
    edrpou: data.partners?.edrpou ?? "",
    is_auto_payment: data.is_auto_payment ?? false,
    payments:
      data.spec_doc?.map(
        (specDoc: {
          documents_id: number;
          pay_sum: number;
          expected_date: string;
          dead_line_date: string;
          is_paid: boolean;
          paid_date: string;
        }) => ({
          documents_id: specDoc.documents_id ?? undefined,
          paySum: specDoc.pay_sum ?? 0,
          expectedDate: specDoc.expected_date ?? undefined,
          deadLineDate: specDoc.dead_line_date ?? undefined,
          isPaid: specDoc.is_paid ?? false,
          paidDate: specDoc.paid_date ?? undefined,
        })
      ) ?? [],
    selectedAccount: data.bank_account ?? "",
    partner_id: data.partner_id != null ? Number(data.partner_id) : 0,
    partnerName: data.partners?.name ?? "",
    purposeOfPayment: data.purpose_of_payment ?? "",
    mfo: data.mfo ?? "",
    note: data.note ?? "",
  };
};
