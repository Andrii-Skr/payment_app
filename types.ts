
// Тип для отдельного платежного документа (специфического платежа)
export type SpecDocType = {
  id: number;
  pay_sum: number;
  // Если задан, то отображается в первую очередь. Если отсутствует, используется dead_line_date
  expected_date?: string; // ISO-формат даты (опционально)
  dead_line_date?: string; // ISO-формат даты (опционально)
  paid_date?: string; // ISO-формат даты (опционально)
  is_paid: boolean;
};

// Тип для информации о контрагенте
export type PartnerType = {
  id: number;
  name: string;
  type: string;
  edrpou: string;
  group: any[];
  entity_id: number; // идентификатор сущности, к которой принадлежит контрагент
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

// Тип для документа (счёта)
export type DocumentType = {
  id: number;
  partner_id: number;
  account_number: string;
  note: string;
  date: string;
  bank_account: string;
  account_sum: number;
  partners: PartnerType;
  spec_doc: SpecDocType[];
};

// Тип для сущности, которая содержит документы
export type EntityType = {
  id: number;
  name: string;
  documents: DocumentType[];
};

// Тип для записи платежей, используемый в таблице EntityTable.
// Поле isExpected показывает, используется ли expected_date (true) или применяется dead_line_date (false)
export type PaymentEntry = {
  spec_doc: SpecDocType;
  document: DocumentType;
  isExpected: boolean;
};

// Тип для деталей платежа, используемый при формировании списков и передачи в модальные окна
export type PaymentDetail = {
  spec_doc_id: number;
  partner_id: number;
  partner_name: string;
  account_number: string;
  note: string;
  date: string;
  pay_sum: number;
};
