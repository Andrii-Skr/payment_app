import { PaymentDetail, PaymentEntry } from "@/types/types";

export function createPaymentDetail(entry: PaymentEntry): PaymentDetail {
  return {
    doc_id: entry.document.id,
    entity_id: entry.document.entity_id,
    spec_doc_id: entry.spec_doc.id,

    partner_id: entry.document.partner_id,
    partner_name: entry.document.partner.full_name,
    partner_edrpou: entry.document.partner.edrpou,

    partner_account_mfo: entry.document.partner_account_number.mfo ?? undefined,
    partner_account_number: entry.document.partner_account_number.bank_account,
    partner_account_bank_name: entry.document.partner_account_number.bank_name ?? undefined,

    account_number: entry.document.account_number,
    purpose_of_payment: entry.spec_doc.purpose_of_payment ?? "",
    dead_line_date: entry.spec_doc.dead_line_date,
    date: entry.document.date,
    pay_sum: Number(entry.spec_doc.pay_sum),
    is_paid: entry.spec_doc.is_paid,
    is_auto_purpose_of_payment: entry.document.is_auto_purpose_of_payment,

    vat_type: entry.document.vat_type,
    vat_percent: Number(entry.document.vat_percent ),
  };
}
