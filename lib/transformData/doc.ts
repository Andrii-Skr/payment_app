import { DocumentWithIncludes } from "@api/documents/[id]/route";
import { FormValues } from "@/types/formTypes";

export const TransformedObject = (data: DocumentWithIncludes): FormValues => {
  return {
    doc_id: data.id,
    entity_id: data.entity_id,
    accountNumber: data.account_number ?? "",
    date: data.date,
    accountSum: data.account_sum?.toString() ?? "0",
    accountSumExpression: data.account_sum_expression ?? "",
    vatType: data.vat_type,
    vatPercent: data.vat_percent != null ? Number(data.vat_percent) : undefined,
    edrpou: data.partner?.edrpou ?? "",
    is_auto_payment: data.is_auto_payment,
    is_auto_purpose_of_payment: data.is_auto_purpose_of_payment,

    payments:
      data.spec_doc?.map((specDoc) => ({
        documents_id: specDoc.documents_id,
        paySum: Number(specDoc.pay_sum),
        expectedDate: specDoc.expected_date,
        deadLineDate: specDoc.dead_line_date,
        purposeOfPayment: specDoc.purpose_of_payment ?? "",
        isPaid: specDoc.is_paid,
        paidDate: specDoc.paid_date,
      })) ?? [],

    partner_account_number_id: data.partner_account_number_id ?? undefined,
    selectedAccount: data.partner_account_number?.bank_account ?? "",
    mfo: data.partner_account_number?.mfo ?? "",
    bank_name: data.partner_account_number?.bank_name ?? "",

    partner_id: data.partner_id ?? undefined,
    short_name: data.partner?.short_name ?? "",
    full_name: data.partner?.full_name ?? "",
    purposeOfPayment: data.purpose_of_payment ?? "",
    note: data.note ?? "",
  };
};
