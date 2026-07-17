import { fetchEntitiesBatch } from "@/services/entityService";
import type { PaymentDetail } from "@/types/types";
import { buildPaymentsCsv } from "@/utils/paymentsCsv";

jest.mock("@/services/entityService", () => ({
  fetchEntitiesBatch: jest.fn(),
}));

const mockedFetchEntitiesBatch = jest.mocked(fetchEntitiesBatch);

const parseCsvRow = (row: string): string[] => {
  const values: string[] = [];
  let value = "";
  let isQuoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (character === '"') {
      if (isQuoted && row[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
    } else if (character === ";" && !isQuoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
};

const payment: PaymentDetail = {
  doc_id: 1,
  entity_id: 10,
  spec_doc_id: 177044,
  partner_id: 20,
  partner_name: "ФОП Босенко Марина Миколаївна",
  partner_edrpou: "2706400448",
  partner_account_number: "UA001",
  partner_account_bank_name: "Банк партнера",
  partner_account_mfo: "123456",
  account_number: "UA002",
  purpose_of_payment: "",
  dead_line_date: null,
  date: new Date("2026-07-06"),
  pay_sum: 100,
  is_paid: false,
  is_auto_purpose_of_payment: false,
  vat_type: false,
  vat_percent: null,
};

beforeEach(() => {
  mockedFetchEntitiesBatch.mockResolvedValue(
    new Map([
      [
        10,
        {
          full_name: "ТОВ Платник",
          edrpou: "12345678",
          bank_account: "UA003",
          bank_name: "Банк платника",
          mfo: "654321",
        },
      ],
    ]) as any,
  );
});

describe("buildPaymentsCsv", () => {
  it("сохраняет точку с запятой в назначении платежа внутри DETAILS", async () => {
    const purpose =
      "2706400448; *39; ФОП Босенко Марина Миколаївна; за використання торгівельної марки згідно рахунку \u2063№ 177044 від 06.07.2026, без ПДВ";
    const blob = await buildPaymentsCsv([{ ...payment, purpose_of_payment: purpose }]);

    const csv = await blob.text();

    expect(csv).toContain(`;"${purpose.replace("\u2063", "")}"`);
    const fields = parseCsvRow(csv.split("\r\n")[1]);
    expect(fields).toHaveLength(14);
    expect(fields[fields.length - 1]).toBe(purpose.replace("\u2063", ""));
  });

  it("удваивает кавычки и сохраняет переносы строк внутри поля", async () => {
    const blob = await buildPaymentsCsv([{ ...payment, purpose_of_payment: 'Оплата "послуг"\nза липень' }]);

    await expect(blob.text()).resolves.toContain('"Оплата ""послуг""\nза липень"');
  });
});
