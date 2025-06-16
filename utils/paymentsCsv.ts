// utils/paymentsCsv.ts
import { format } from "date-fns";
import type { PaymentDetail } from "@/types/types";
import { fetchEntitiesBatch } from "@/services/entityService";

const INVISIBLE_SEPARATOR = "\u2063";

type CsvRow = Record<string, string>;

/** Порядок колонок в итоговом файле */
const CSV_HEADER =
  "DAY;NUMBER;A;B;OKPO_A;OKPO_B;ACCOUNT_A;ACCOUNT_B;BANK_A;BANK_B;" +
  "MFO_A;MFO_B;AMOUNT;DETAILS";

/**
 * Формируем CSV-файл из списка платежей.
 * @param payments массив PaymentDetail
 * @returns Blob с text/csv
 */
export const buildPaymentsCsv = async (
  payments: PaymentDetail[]
): Promise<Blob> => {
  // Собираем уникальные entity_id
  const entityIds = Array.from(new Set(payments.map((p) => p.entity_id)));

  // Загружаем информацию о плательщиках
  const entities = await fetchEntitiesBatch(entityIds); // Map<number, entity>

  // Формируем строки
  const rows: CsvRow[] = payments.map((p) => {
    const payer = entities.get(p.entity_id);

    return {
      DAY: format(new Date(), "yyyy-MM-dd"),
      NUMBER: p.spec_doc_id.toString()?? "",
      A: payer?.full_name ?? "",
      B: p.partner_name ?? "",
      OKPO_A: payer?.edrpou ?? "",
      OKPO_B: p.partner_edrpou ?? "",
      ACCOUNT_A: payer?.bank_account ?? "",
      ACCOUNT_B: p.partner_account_number,
      BANK_A: payer?.bank_name ?? "",
      BANK_B: p.partner_account_bank_name ?? "",
      MFO_A: payer?.mfo ?? "",
      MFO_B: p.partner_account_mfo ?? "",
      AMOUNT: p.pay_sum.toFixed(2).replace(".", ","),
      DETAILS: p.purpose_of_payment.replace(new RegExp(INVISIBLE_SEPARATOR, "g"), ""),
    };
  });

  // Собираем CSV
  const csvBody = rows.map((r) => Object.values(r).join(";")).join("\r\n");
  const csvContent = `${CSV_HEADER}\r\n${csvBody}`;

  return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
};

/**
 * Скачиваем Blob как файл.
 * @param blob Blob, полученный из buildPaymentsCsv
 * @param filename имя файла (например, payments_20250423_1200.csv)
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  });
  link.click();
  URL.revokeObjectURL(url);
};
