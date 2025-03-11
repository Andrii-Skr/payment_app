export type SpecDocType = {
  id: number;
  pay_sum: number;
  expected_date: string; // ISO-формат даты
  dead_line_date: string;
  paid_date: string; 
  is_paid: boolean;
};

export type DocumentType = {
  id: number;
  partner_id: number;
  account_number: string;
  date: string;
  bank_account: string;
  account_sum: number;
  partners: {
    id: number;
    name: string;
    type: string;
    edrpou: string;
    group: any[];
    entity_id: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
  };
  spec_doc: SpecDocType[];
};

export type PaymentEntry = {
  spec_doc: SpecDocType;
  document: DocumentType;
  type: "expected" | "deadline";
};

// При клике в ячейке передадутся следующие поля –
// spec_doc_id (идентификатор spec_doc), partner_id, partner_name, account_number, date, pay_sum.
export type PaymentDetail = {
  spec_doc_id: number;
  partner_id: number;
  partner_name: string;
  account_number: string;
  date: string;
  pay_sum: number;
};
