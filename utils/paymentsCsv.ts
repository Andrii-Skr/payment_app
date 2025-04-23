// utils/paymentsCsv.ts
import { format } from "date-fns";
import type { PaymentDetail } from "@/types/types";
import { entity } from "@prisma/client";
import { fetchEntitiesBatch } from "@/services/entityService";

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
  payments: PaymentDetail[],
): Promise<Blob> => {
  /* 1. Собираем id плательщиков и контрагентов */
  const ids = Array.from(
    new Set(payments.flatMap(p => [p.entity_id, p.partner_entity_id])),
  );

  /* 2. Тянем реквизиты одним батчем */
  const entities = await fetchEntitiesBatch(ids); // Map<number, entity>

  /* 3. Строим строки CSV */
  const rows: CsvRow[] = payments.map(p => {
    const payer = entities.get(p.entity_id) as entity | undefined;
    const partnerEnt = entities.get(p.partner_entity_id) as entity | undefined;

    return {
      DAY: format(new Date(p.date), "yyyy-MM-dd HH:mm:ss"),
      NUMBER: p.account_number,
      A: payer?.name ?? "",
      B: p.partner_name,
      OKPO_A: payer?.edrpou ?? "",
      OKPO_B: partnerEnt?.edrpou ?? "",
      ACCOUNT_A: payer?.bank_account ?? "",
      ACCOUNT_B: p.partner_account_number,
      BANK_A: payer?.bank_name ?? "",
      BANK_B: p.partner_account_bank_name,
      MFO_A: payer?.mfo ?? "",
      MFO_B: p.partner_account_mfo,
      AMOUNT: p.pay_sum.toFixed(2).replace(".", ","),
      DETAILS: p.purpose_of_payment,
    };
  });

  /* 4. Склеиваем контент */
  const csvBody = rows.map(r => Object.values(r).join(";")).join("\r\n");
  const csvContent = `${CSV_HEADER}\r\n${csvBody}`;

  /* 5. Возвращаем Blob */
  return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
};

/**
 * Скачиваем Blob как файл.
 * @param blob   Blob, полученный из buildPaymentsCsv
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
