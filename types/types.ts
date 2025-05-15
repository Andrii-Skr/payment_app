import { EntityWithAll } from "@/app/api/(v1)/(protected)/documents/entities/route";

export type DocumentType = EntityWithAll["documents"][number];

export type PartnerType = DocumentType["partner"];

export type SpecDocType = DocumentType["spec_doc"][number];

export type PaymentEntry = {
  document: DocumentType;
  spec_doc: DocumentType["spec_doc"][number];
  isExpected: boolean;
};

// Тип для деталей платежа, используемый при формировании списков и передачи в модальные окна
export type PaymentDetail = {
  doc_id: number;
  entity_id: number;
  spec_doc_id: number;
  partner_entity_id: number;

  partner_id: number;
  partner_name: string;

  partner_account_number: string;
  partner_account_bank_name?: string;
  partner_account_mfo?: string;

  account_number: string;
  purpose_of_payment: string;

  dead_line_date: Date | null;
  date: Date;
  pay_sum: number;
};
